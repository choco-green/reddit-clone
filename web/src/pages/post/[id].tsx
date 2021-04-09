import { Heading } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { Layout } from "../../components/Layout";
import { usePostQuery } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";

export const Post = ({}) => {
	const router = useRouter();
	const intId = typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
	const [{ data, error, fetching }] = usePostQuery({
		pause: intId === -1,
		variables: {
			id: intId,
		},
	});

	if (fetching) {
		return <div>loading...</div>;
	}

	if (!data?.post) {
		return (
			<Layout>
				<div>could not find post</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<Heading>{data.post.title}</Heading>
			<br />
			{data.post.text}
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);