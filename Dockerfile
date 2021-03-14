FROM node:15-alpine3.12
ARG HELPPO_CLI_VERSION
RUN yarn global add helppo-cli@${HELPPO_CLI_VERSION}
ENTRYPOINT [ "helppo-cli" ]
