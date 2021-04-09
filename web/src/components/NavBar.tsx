import { useApolloClient } from "@apollo/client";
import { Box, Button, Flex, Heading, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
	const [logout, { loading: logoutLoading }] = useLogoutMutation();
	const apolloClient = useApolloClient();
	const { data, loading } = useMeQuery({ skip: isServer() });
	let body = null;

	if (loading) {
		// data is loading
		body = null;
	} else if (!data?.me) {
		// user not logged in
		body = (
			<>
				<NextLink href="/login">
					<Link color="white" mr={2}>
						Login
					</Link>
				</NextLink>
				<NextLink href="/register">
					<Link color="white">Register</Link>
				</NextLink>
			</>
		);
	} else {
		//user is logged in
		body = (
			<Flex align="center">
				<NextLink href="create-post">
					<Button as={Link} mr={4}>
						create post
					</Button>
				</NextLink>
				<Box mr={2}>{data.me.username}</Box>
				<Button
					onClick={async () => {
						await logout();
						await apolloClient.resetStore();
					}}
					isLoading={logoutLoading}
					variant="link"
				>
					Logout
				</Button>
			</Flex>
		);
	}
	return (
		<Flex zIndex={1} position="sticky" top={0} bg="tomato" p={4}>
			<Flex flex={1} m="auto" maxW={800} align="center">
				<NextLink href="/">
					<Link>
						<Heading>NewReddit</Heading>
					</Link>
				</NextLink>
				<Box ml={"auto"}>{body}</Box>
			</Flex>
		</Flex>
	);
};
