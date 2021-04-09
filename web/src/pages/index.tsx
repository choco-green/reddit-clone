import { Box, Button, Flex, Heading, Link, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { EditDeletePostButtons } from "../components/EditDeletePostButtons";
import { Layout } from "../components/Layout";
import { UpdootSection } from "../components/UpdootSection";
import { PostsQuery, usePostsQuery } from "../generated/graphql";

const Index = () => {
	const { data, error, loading, fetchMore, variables } = usePostsQuery({
		variables: { limit: 15, cursor: null as null | string },
		notifyOnNetworkStatusChange: true,
	});

	if (!loading && !data) {
		return (
			<div>
				<div>Oops, something went wrong!</div>
				<div>{error?.message}</div>
			</div>
		);
	}

	return (
		<Layout>
			{loading && !data ? (
				<div>loading...</div>
			) : (
				<Stack spacing={8}>
					{data.posts.posts.map((p) =>
						!p ? null : (
							<Flex key={p.id} p={5} shadow="md" borderWidth="1px">
								<UpdootSection post={p} />
								<Box flex={1}>
									<NextLink href="/post/[id]" as={`/post/${p.id}`}>
										<Link>
											<Heading fontSize="xl">{p.title}</Heading>
										</Link>
									</NextLink>
									<Text>posted by {p.creator.username}</Text>
									<Flex>
										<Text flex={1} mt={4}>
											{p.textSnippet}
										</Text>
										<EditDeletePostButtons id={p.id} creatorId={p.creator.id} />
									</Flex>
								</Box>
							</Flex>
						)
					)}
				</Stack>
			)}
			{data && data.posts.hasMore ? (
				<Flex>
					<Button
						isLoading={loading}
						m="auto"
						my={8}
						onClick={() => {
							fetchMore({
								variables: {
									limit: variables!.limit,
									cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
								},
								// updateQuery: (previousValue, { fetchMoreResult }): PostsQuery => {
								// 	if (!fetchMoreResult) {
								// 		return previousValue;
								// 	}
								// 	return {
								// 		__typename: "Query",
								// 		posts: {
								// 			__typename: "PaginatedPosts",
								// 			hasMore: fetchMoreResult.posts.hasMore,
								// 			posts: [...previousValue.posts.posts, ...fetchMoreResult.posts.posts],
								// 		},
								// 	};
								// },
							});
						}}
					>
						Load more
					</Button>
				</Flex>
			) : null}
		</Layout>
	);
};

export default Index;
