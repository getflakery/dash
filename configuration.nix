{ config, pkgs, ... }:

{
  system.stateVersion = "23.05";

  # Enable common container config files in /etc/containers
  virtualisation.containers.enable = true;
  virtualisation = {
    podman = {
      enable = true;

      # Create a `docker` alias for podman, to use it as a drop-in replacement
      dockerCompat = true;
      # docker socket
      dockerSocket.enable = true;

      # Required for containers under podman-compose to be able to talk to each other.
      defaultNetwork.settings.dns_enabled = true;
    };
  };
  #  mkdir /persist/nocodb 
  systemd.services.create-dir = {
    description = "Create directory";
    wantedBy = [ "multi-user.target" ];
    script = ''
      mkdir -p /persist/nocodb
    '';
  };

  # make nocodb depend on create-dir
  virtualisation.oci-containers.backend = "podman";
  systemd.services.podman-nocodb.after = [ "create-dir.service" ];

  virtualisation.oci-containers.containers = {
    flakery = {
      image = "public.ecr.aws/t7q1f7c9/flakery:latest";
      autoStart = true;
      ports = [ "3000:3000" ];
      environmentFiles = [ "/.env" ];
    };
    watchtower = {
      image = "containrrr/watchtower";
      autoStart = true;
      volumes = [ "/var/run/docker.sock:/var/run/docker.sock" ];
    };
  };

  # port 3000
  networking.firewall.allowedTCPPorts = [ 3000 ];

}
