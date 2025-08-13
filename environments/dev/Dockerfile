FROM ubuntu:24.04 AS environment

ARG workdir=/work
ARG homedir=/home/dev
ENV WORKDIR=${workdir}
ENV HOMEDIR=${homedir}

RUN \
  apt-get update

# Optimize
RUN \
    sed --in-place --regexp-extended "s/(\/\/)(archive\.ubuntu)/\1au.\2/" /etc/apt/sources.list && \
    ln -fs /usr/share/zoneinfo/Australia/Perth /etc/localtime && \
    export DEBIAN_FRONTEND=noninteractive && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        dumb-init \
        gosu \
        tzdata \
        && \
    dpkg-reconfigure --frontend noninteractive tzdata

# Install NodeJS
RUN \
  apt-get install -y curl && \
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
  apt-get install -y nodejs

COPY --chmod=0500 docker-entrypoint.sh docker-entrypoint.sh
WORKDIR ${workdir}
ENTRYPOINT ["dumb-init", "/docker-entrypoint.sh"]
CMD ["/bin/bash"]