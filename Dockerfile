FROM node:latest

# Set the working directory
# This is the base directory used in any further RUN, COPY, and ENTRYPOINT commands
# This is a good place to put your application's code
WORKDIR /app

# Copy the package.json and yarn.lock files
# Do this in a separate command so that the dependencies are cached
# This way, if you don't change the dependencies, Docker will use the cached version
# This is a huge time saver
COPY package.json yarn.lock ./

# Install the dependencies
# The --production=false flag is used to install the development dependencies
# This is important because the development dependencies are used to build the application
RUN yarn install --production=false

# Copy the rest of the application files
# This is done after the dependencies are installed so that the dependencies are cached
COPY . .

# Set the environment variable
# This is used to tell the application that it's running in a production environment
# This is important because it will disable the development tools
ENV NODE_ENV=production

# Build the application
RUN yarn build

# Expose port 3000
# This is the port that the application will run on
EXPOSE 3000

# Start the application
CMD ["yarn", "start"]
