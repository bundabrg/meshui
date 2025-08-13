# -*- mode: ruby -*-
# vi: set ft=ruby :

# This file is only needed if your developer environment does not provide
# the tools necessary to run the bdf script, for example if this is being
# developed on a windows PC.
Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/jammy64"

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine. In the example below,
  # accessing "localhost:8080" will access port 80 on the guest machine.
  # NOTE: This will enable public access to the opened port
  # config.vm.network "forwarded_port", guest: 80, host: 8080

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine and only allow access
  # via 127.0.0.1 to disable public access
  # config.vm.network "forwarded_port", guest: 80, host: 8080, host_ip: "127.0.0.1"

  # Create a private network, which allows host-only access to the machine
  # using a specific IP.
  # config.vm.network "private_network", ip: "192.168.33.10"

  # Create a public network, which generally matched to bridged network.
  # Bridged networks make the machine appear as another physical device on
  # your network.
  # config.vm.network "public_network", bridge: ["enp4s0", "enx00e04c2096a3"], auto_config: false

  config.vm.provision "shell", inline: <<-SHELL
      # Add Docker's official GPG key:
      apt-get update
      apt-get install -y ca-certificates curl
      install -m 0755 -d /etc/apt/keyrings
      curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
      chmod a+r /etc/apt/keyrings/docker.asc

      # Add the repository to Apt sources:
      echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
        $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
        tee /etc/apt/sources.list.d/docker.list > /dev/null
       apt-get update
       apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

       # Add Vagrant user to docker group
       usermod -aG docker vagrant

       # Create docker buildx environment
       su vagrant -c docker buildx create --use

       # Start in the workdir
       echo >> ~/.bash_profile
       echo "# automatically cd to /vagrant folder when vagrant ssh" >> ~/.bash_profile
       echo "cd /vagrant" >> ~/.bash_profile
  SHELL
end
