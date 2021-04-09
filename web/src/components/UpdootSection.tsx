import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Box, Flex, IconButton } from "@chakra-ui/react";
import React, { useState } from "react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface UpdootSectionProps {
	post: PostSnippetFragment;
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
	const [loadingState, setLoadingState] = useState<"updoot-loading" | "downdoot-loading" | "not-loading">(
		"not-loading"
	);
	const [{ fetching, operation }, vote] = useVoteMutation();
	console.log(operation?.variables?.value);
	return (
		<Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
			<IconButton
				onClick={async () => {
					if (post.voteStatus === 1) {
						return;
					}
					setLoadingState("updoot-loading");
					await vote({
						postId: post.id,
						value: 1,
					});
					setLoadingState("not-loading");
				}}
				colorScheme={post.voteStatus === 1 ? "green" : undefined}
				isLoading={loadingState === "updoot-loading"}
				aria-label="upvote"
				icon={<ChevronUpIcon />}
				h={6}
			/>
			<Box m={1}>{post.points}</Box>
			<IconButton
				onClick={async () => {
					if (post.voteStatus === -1) {
						return;
					}
					setLoadingState("downdoot-loading");
					await vote({
						postId: post.id,
						value: -1,
					});
					setLoadingState("not-loading");
				}}
				colorScheme={post.voteStatus === -1 ? "red" : undefined}
				isLoading={loadingState === "downdoot-loading"}
				aria-label="downvote"
				icon={<ChevronDownIcon />}
				h={6}
			/>
		</Flex>
	);
};
