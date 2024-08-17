{ config, pkgs, ... }:

{
  system.stateVersion = "23.05";


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
  networking.firewall.interfaces.podman0.allowedUDPPorts = [ 53 ];

  # make nocodb depend on create-dir
  virtualisation.oci-containers.backend = "podman";

  virtualisation.oci-containers.containers = {
    flakery = {
      image = "public.ecr.aws/t7q1f7c9/flakery:latest";
      autoStart = true;
      ports = [ "3000:3000" ];
      environmentFiles = [ "/.env" ];
      extraOptions = [ "--cap-add=CAP_NET_RAW" ]; # maybe not needed

    };
    watchtower = {
      image = "containrrr/watchtower";
      autoStart = true;
      volumes = [ "/var/run/docker.sock:/var/run/docker.sock" ];
      # -i 2
      cmd = [ "-i" "2" ];
    };
  };
  systemd.services.podman-flakery = {
    serviceConfig = {
      Restart = "always";
    };
  };
  # port 3000
  networking.firewall.allowedTCPPorts = [ 3000 ];



}
