import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../components/InputField";
import { Layout } from "../components/Layout";
import { useCreatePostMutation } from "../generated/graphql";
import { useIsAuth } from "../utils/useIsAuth";

export const CreatePost: React.FC<{}> = ({}) => {
	const router = useRouter();
	useIsAuth();
	const [createPost] = useCreatePostMutation();
	return (
		<Layout variant="small">
			<Formik
				initialValues={{ title: "", text: "" }}
				onSubmit={async (values, { setErrors }) => {
					const { errors } = await createPost({ variables: { input: values } });
					if (!errors) router.push("/");
				}}
			>
				{(props) => (
					<Form>
						<InputField name="title" placeholder="title" label="Title" />
						<Box mt={4}>
							<InputField textarea name="text" placeholder="text" label="body" />
						</Box>
						<Button mt={4} type="submit" isLoading={props.isSubmitting} colorScheme="teal">
							create post
						</Button>
					</Form>
				)}
			</Formik>
		</Layout>
	);
};

export default CreatePost;
