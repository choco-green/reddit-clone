import argon2 from "argon2";
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { getConnection } from "typeorm";
import { v4 } from "uuid";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { User } from "../entities/User";
import { MyContext } from "../types";
import { sendEmail } from "../utils/sendEmail";
import { validateRegister } from "../utils/validateRegister";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
@ObjectType() // necessary for mapping errors in a cleaner way
class FieldError {
	@Field()
	field: String;

	@Field()
	message: String;
}

@ObjectType() // error mapping with user response used in UserResolver
class UserResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => User, { nullable: true })
	user?: User;
}

@Resolver() // main class for handling user actions
export class UserResolver {
	@Query(() => User, { nullable: true })
	me(@Ctx() { req }: MyContext) {
		// return if user doesn't exist
		if (!req.session.userId) {
			return null;
		}

		// finding "user" object with userId
		return User.findOne(req.session.userId);
	}

	@Mutation(() => UserResponse)
	async register(@Arg("options") options: UsernamePasswordInput, @Ctx() { req }: MyContext): Promise<UserResponse> {
		// validating the username, email and password
		// returns error if there is any
		const errors = validateRegister(options);
		if (errors) {
			return { errors };
		}

		// hashing password and updating user
		const hashedPassword = await argon2.hash(options.password);
		let user;
		try {
			const result = await getConnection()
				.createQueryBuilder()
				.insert()
				.into(User)
				.values({
					username: options.username,
					password: hashedPassword,
					email: options.email,
				})
				.returning("*")
				.execute();
			user = result.raw[0];
		} catch (err) {
			if (err.code === "23505") {
				return {
					errors: [
						{
							field: "username",
							message: "username already taken",
						},
					],
				};
			}
		}

		// stores cookie (automatic log in)
		req.session.userId = user.id;
		return { user };
	}

	@Mutation(() => UserResponse)
	async login(
		@Arg("usernameOrEmail") usernameOrEmail: string,
		@Arg("password") password: string,
		@Ctx() { req }: MyContext
	): Promise<UserResponse> {
		const user = await User.findOne(
			usernameOrEmail.includes("@")
				? { where: { email: usernameOrEmail } }
				: { where: { username: usernameOrEmail } }
		);
		if (!user) {
			return {
				errors: [
					{
						field: "usernameOrEmail",
						message: "the username doesn't exist",
					},
				],
			};
		}

		const valid = await argon2.verify(user.password, password);
		if (!valid) {
			return {
				errors: [
					{
						field: "password",
						message: "incorrect password",
					},
				],
			};
		}

		req.session.userId = user.id;

		return { user };
	}

	@Mutation(() => Boolean)
	async forgotPassword(@Arg("email") email: string, @Ctx() { redis }: MyContext) {
		// finding "user" object with email
		const user = await User.findOne({ where: { email } });

		// the email is not in the db
		if (!user) {
			return true; // choosing not to tell user whether the email exist in the db
		}

		// generating token
		const token = v4();

		// setting token to a redirect link to redis server backend
		await redis.set(FORGET_PASSWORD_PREFIX + token, user.id, "ex", 1000 * 60 * 60 * 24 * 3); //3 days

		// sending email to user
		await sendEmail(email, `<a href='http://localhost:3000/change-password/${token}'>reset password</a>`);
		return true;
	}

	@Mutation(() => UserResponse)
	async changePassword(
		@Arg("token") token: string,
		@Arg("newPassword") newPassword: string,
		@Ctx() { redis, req }: MyContext
	): Promise<UserResponse> {
		// validity of password
		if (newPassword.length <= 2) {
			return {
				errors: [
					{
						field: "newPassword",
						message: "length must be greater than 2",
					},
				],
			};
		}

		// setting key as variable
		// so it can be deleted afterward
		const key = FORGET_PASSWORD_PREFIX + token;

		// calling redis server to search for userId based on token
		const userId = await redis.get(key);

		if (!userId) {
			return {
				errors: [
					{
						field: "token",
						message: "token expired",
					},
				],
			};
		}

		// finding "user" object with userId
		const userIdNum = parseInt(userId);
		const user = await User.findOne(userIdNum);

		// extremely rare to happen
		// only if the server were deleting the user
		if (!user) {
			return {
				errors: [
					{
						field: "token",
						message: "user no longer exists",
					},
				],
			};
		}

		// hashing password and updating user
		await User.update({ id: userIdNum }, { password: await argon2.hash(newPassword) });

		// deleting the redirect link
		// to stop user from changing their password again based on the same link
		await redis.del(key);

		// log in user after change password
		req.session.userId = user.id;
		return { user };
	}

	@Mutation(() => Boolean)
	logout(@Ctx() { req, res }: MyContext) {
		return new Promise((resolve) =>
			req.session.destroy((err) => {
				// clearing cookie
				res.clearCookie(COOKIE_NAME);

				// return error if failed
				if (err) {
					console.log(err);
					resolve(false);
					return;
				}

				// return true when succeeded
				resolve(true);
			})
		);
	}
}
