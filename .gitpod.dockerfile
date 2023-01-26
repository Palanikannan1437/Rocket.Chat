FROM gitpod/workspace-full:2022-12-15-12-38-23

# installing meteor
RUN curl https://install.meteor.com/?release=$(curl -so- https://raw.githubusercontent.com/RocketChat/Rocket.Chat/develop/apps/meteor/.meteor/release | cut -d@ -f2) | sh

# installing a specific node version
RUN bash -c 'VERSION="14.21.2" \
     && source $HOME/.nvm/nvm.sh && nvm install $VERSION \
     && nvm use $VERSION && nvm alias default $VERSION'

RUN echo "nvm use default &>/dev/null" >> ~/.bashrc.d/51-nvm-fix
