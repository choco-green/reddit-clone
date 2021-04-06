import { Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { NextPage } from "next";
import router from "next/router";
import React from "react";
import { InputField } from "../../components/InputField";
import { Wrapper } from "../../components/Wrapper";
import { toErrorMap } from "../../utils/toErrorMap";
import register from "../register";

const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
	return (
		<Wrapper variant="small">
			<Formik
				initialValues={{ newPassword: "" }}
				onSubmit={async (values, { setErrors }) => {
					// const response = await register({options: values});
					// if (response.data?.register.errors) {
					//   setErrors(toErrorMap(response.data.register.errors));
					// } else if (response.data?.register.user) {
					//   // worked
					//   router.push("/");
					// }
				}}
			>
				{(props) => (
					<Form>
						<Box>
							<InputField
								name="newPassword"
								placeholder="new password"
								label="New Password"
								type="password"
							/>
						</Box>
						<Button mt={4} type="submit" isLoading={props.isSubmitting} colorScheme="teal">
							Change Password
						</Button>
					</Form>
				)}
			</Formik>
		</Wrapper>
	);
};

ChangePassword.getInitialProps = ({ query }) => {
	return {
		token: query.token as string,
	};
};

export default ChangePassword;
