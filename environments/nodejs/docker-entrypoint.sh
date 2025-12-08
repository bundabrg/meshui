#!/bin/bash

# Work out what user we want to be
if [ -z ${RUN_UID} ];then
  # Use the UID of the project folder
  RUN_UID=$(ls -dn ${WORKDIR} | cut -d" " -f 3)
fi

# Modify existing user homdir OR create user if needed
RUN_USER=$(id -un ${RUN_UID})
if [ -z ${RUN_USER} ]; then
  RUN_USER=executor
  useradd -u ${RUN_UID} --user-group -d ${LOCALDIR}/home ${RUN_USER} >& /dev/null
else
  gosu ${RUN_USER} mkdir -p ${LOCALDIR}/home
  mv $(getent passwd ${RUN_USER} | cut -d : -f 6)/{.[!.],}* ${LOCALDIR}/home >& /dev/null
  usermod -d ${LOCALDIR}/home ${RUN_USER}
fi

### If a docker.sock exists we will update our docker group to match its group
#if [ -e "/var/run/docker.sock" ]; then
#  groupmod -og $(ls -dn /var/run/docker.sock | cut -d" " -f 4) docker
#fi


## Setup User Account
#RUN \
#  useradd \
#    -u ${uid} \
#    -g ${gid} \
#    --non-unique \
#    --shell /bin/bash \
#    ${username}
exec gosu ${RUN_USER} "$@"
