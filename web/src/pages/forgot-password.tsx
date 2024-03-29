import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import React, { useState } from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { useForgotPasswordMutation } from "../generated/graphql";

export const ForgotPassword: React.FC<{}> = ({}) => {
	const [complete, setComplete] = useState(false);
	const [forgotPassword] = useForgotPasswordMutation();
	return (
		<Wrapper variant="small">
			<Formik
				initialValues={{ email: "" }}
				onSubmit={async (values) => {
					await forgotPassword({ variables: values });
					setComplete(true);
				}}
			>
				{(props) =>
					complete ? (
						<Box>If an account with that email exists, we have sent you an email</Box>
					) : (
						<Form>
							<InputField name="email" placeholder="email" label="Email" type="email" />
							<Button mt={4} type="submit" isLoading={props.isSubmitting} colorScheme="teal">
								forgot password
							</Button>
						</Form>
					)
				}
			</Formik>
		</Wrapper>
	);
};

export default ForgotPassword;
