import Layout from "@/components/layout";
import { usePocketBase } from "@/pocketbase";
import { useAuth } from "@/pocketbase/auth";
import { Token } from "@/pocketbase/models";
import { ShareMeEnv, withEnv } from "@/utils/env";
import {
  ActionIcon,
  Button,
  CloseButton,
  Code,
  Container,
  CopyButton,
  Flex,
  Group,
  Modal,
  Paper,
  Stack,
  Switch,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useClipboard, useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconCirclePlus,
  IconClipboard,
  IconClipboardCheck,
  IconKey,
} from "@tabler/icons-react";
import { GetServerSideProps } from "next";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";

interface SettingsProps extends ShareMeEnv {}

function Settings({ signUpEnabled }: SettingsProps) {
  const pb = usePocketBase();
  const client = useQueryClient();

  const clipboard = useClipboard();

  const { data } = useQuery(["apiKeys"], () =>
    pb.collection("tokens").getFullList<Token>()
  );

  const [revokeTokenOpen, { open, close }] = useDisclosure();
  const [currentRevokingToken, setCurrentRevokingToken] = useState("");

  const { mutate: updateToken } = useMutation(
    ({ id, ...props }: Token) =>
      pb.collection("tokens").update<Token>(id, props),
    {
      onSuccess: () => {
        client.invalidateQueries("apiKeys");
      },
    }
  );

  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  const { mutate: createKey } = useMutation(
    () =>
      fetch(pb.buildUrl("/api/keys"), {
        method: "POST",
        headers: { Authorization: `Bearer ${pb.authStore.token}` },
      }),
    {
      onSuccess: async (data) => {
        client.invalidateQueries("apiKeys");
        const res = await data.json();
        clipboard.copy(res.token);
        setApiKey(res.token);
        setShowApiKey(true);
        notifications.show({
          withCloseButton: true,
          autoClose: 5000,
          title: "API Key Created",
          message: "API key has been created and copied to your clipboard.",
          color: "indigo",
          icon: <IconKey size={16} />,
        });
      },
    }
  );

  return (
    <Layout signUpEnabled={signUpEnabled}>
      <Modal
        title="Revoke Token"
        onClose={close}
        centered
        opened={revokeTokenOpen}
      >
        <Stack>
          <Text color="dimmed">
            Are you sure you want to revoke this token? This action can not be
            undone.
          </Text>
          <Group sx={{ justifyContent: "end" }}>
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              color="red"
              variant="outline"
              onClick={() => {
                updateToken({
                  id: currentRevokingToken,
                  revoked: true,
                } as Token);
                close();
              }}
            >
              Revoke
            </Button>
          </Group>
        </Stack>
      </Modal>
      <Container size="sm" m="0 auto">
        <Stack>
          <Paper p="md" sx={(theme) => ({ background: theme.colors.dark[6] })}>
            <Stack>
              <Flex justify="space-between" align="center">
                <Title order={3}>API Keys</Title>
                <Button
                  radius="xl"
                  variant="gradient"
                  leftIcon={<IconCirclePlus />}
                  onClick={() => createKey()}
                >
                  Create API Key
                </Button>
              </Flex>
              {showApiKey && (
                <Paper p="sm">
                  <Stack spacing="xs">
                    <Flex gap="lg">
                      <Text size="sm">
                        Your API key has been created and its value was copied
                        to your clipboard. You cannot retrieve it later on.
                      </Text>
                      <CloseButton onClick={() => setShowApiKey(false)} />
                    </Flex>
                    <Code
                      sx={{
                        overflowWrap: "anywhere",
                        display: "block",
                        position: "relative",
                      }}
                    >
                      <CopyButton value={apiKey}>
                        {({ copied, copy }) => (
                          <ActionIcon
                            onClick={copy}
                            pos="absolute"
                            top={4}
                            right={4}
                            variant="filled"
                          >
                            {copied ? (
                              <IconClipboardCheck />
                            ) : (
                              <IconClipboard />
                            )}
                          </ActionIcon>
                        )}
                      </CopyButton>
                      {apiKey}
                    </Code>
                  </Stack>
                </Paper>
              )}
              <Table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Revoked</th>
                    <th>Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.map((token) => (
                    <tr key={token.id}>
                      <td>
                        <Code>{token.id}</Code>
                      </td>
                      <td>
                        {token.revoked ? (
                          <Button disabled>Revoked</Button>
                        ) : (
                          <Button
                            color="red"
                            variant="outline"
                            onClick={() => {
                              setCurrentRevokingToken(token.id);
                              open();
                            }}
                          >
                            Revoke
                          </Button>
                        )}
                      </td>
                      <td>
                        <DateTimePicker
                          value={token.expires ? new Date(token.expires) : null}
                          onChange={(date) =>
                            date &&
                            updateToken({
                              ...token,
                              expires: date.toISOString(),
                            } as Token)
                          }
                          disabled={token.revoked}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Layout>
  );
}

export default Settings;

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: withEnv({}),
  };
};
