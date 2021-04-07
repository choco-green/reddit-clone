import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { useLoginMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { toErrorMap } from "../utils/toErrorMap";

export const Login: React.FC<{}> = ({}) => {
	const router = useRouter();
	const [, login] = useLoginMutation();
	return (
		<Wrapper variant="small">
			<Formik
				initialValues={{ usernameOrEmail: "", password: "" }}
				onSubmit={async (values, { setErrors }) => {
					const response = await login(values);
					if (response.data?.login.errors) {
						setErrors(toErrorMap(response.data.login.errors));
					} else if (response.data?.login.user) {
						typeof router.query.next === "string" ? router.push(router.query.next) : router.push("/")
					}
				}}
			>
				{(props) => (
					<Form>
						<InputField name="usernameOrEmail" placeholder="username or email" label="Username or Email" />
						<Box mt={4}>
							<InputField name="password" placeholder="password" label="Password" type="password" />
						</Box>
						<Flex justifyContent="space-between" alignItems="baseline">
							<Button mt={4} type="submit" isLoading={props.isSubmitting} colorScheme="teal">
								Login
							</Button>
							<Box>
								<NextLink href="/forgot-password">
									<Link mb={5}>forgot password?</Link>
								</NextLink>
							</Box>
						</Flex>
					</Form>
				)}
			</Formik>
		</Wrapper>
	);
};

export default withUrqlClient(createUrqlClient)(Login);
