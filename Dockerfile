##########################################################
# Dockerfile for Fragments Testing UI                    #
##########################################################

# Stage 0: Install alpine Linux + node + npm + dependencies
FROM node:20.1.0-alpine3.17@sha256:6e56967f8a4032f084856bad4185088711d25b2c2c705af84f57a522c84d123b AS dependencies

ENV NODE_ENV=production

WORKDIR /app

# Copy only the package files and install dependencies
COPY package.json package-lock.json ./

# Install production dependencies
RUN apk add --no-cache python3=3.10.12-r0 make=4.3-r1 g++=12.2.1_git20220924-r4 && \
    npm ci --only=production

#######################################################################


# Stage 1: Use dependencies to build the site
FROM dependencies AS builder

WORKDIR /app

# Copy the entire source code into the image
COPY . .

ARG API_URL && \
    AWS_COGNITO_POOL_ID && \
    AWS_COGNITO_CLIENT_ID && \
    AWS_COGNITO_HOSTED_UI_DOMAIN && \
    OAUTH_SIGN_IN_REDIRECT_URL && \
    OAUTH_SIGN_OUT_REDIRECT_URL 

ENV API_URL=${API_URL:-undefined} \
    AWS_COGNITO_POOL_ID=${AWS_COGNITO_POOL_ID:-undefined} \
    AWS_COGNITO_CLIENT_ID=${AWS_COGNITO_CLIENT_ID:-undefined} \
    AWS_COGNITO_HOSTED_UI_DOMAIN=${AWS_COGNITO_HOSTED_UI_DOMAIN:-undefined}  \
    OAUTH_SIGN_IN_REDIRECT_URL=${OAUTH_SIGN_IN_REDIRECT_URL:-undefined} \
    OAUTH_SIGN_OUT_REDIRECT_URL=${OAUTH_SIGN_OUT_REDIRECT_URL:-undefined}

# Build the site to /app/dist and remove .env after build
RUN npx parcel build src/index.html && \
    unset API_URL AWS_COGNITO_POOL_ID AWS_COGNITO_CLIENT_ID AWS_COGNITO_HOSTED_UI_DOMAIN OAUTH_SIGN_IN_REDIRECT_URL OAUTH_SIGN_OUT_REDIRECT_URL

########################################################################

# Stage 2: Nginx web server to host the built site
FROM nginx:stable-alpine@sha256:5e1ccef1e821253829e415ac1e3eafe46920aab0bf67e0fe8a104c57dbfffdf7 AS deploy

# Copy the built site from the builder stage into the nginx image
COPY --from=builder /app/dist/ /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=30s --start-period=10s --retries=3 \
    CMD curl --fail http://localhost:80 || exit 1
