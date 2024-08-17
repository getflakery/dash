{ config, pkgs, lib, ... }:

let
  assignEIP = pkgs.writeShellApplication {
    name = "assign-eip";
    runtimeInputs = [ pkgs.awscli2 pkgs.curl ];
    text = ''
      ELASTIC_IP="todo"
      INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
      ALLOCATION_ID=$(aws ec2 describe-addresses --public-ips $ELASTIC_IP --query 'Addresses[0].AllocationId' --output text)
      ASSOCIATION_ID=$(aws ec2 describe-addresses --public-ips $ELASTIC_IP --query 'Addresses[0].AssociationId' --output text)

      # Check if the Elastic IP is already associated
      if [ "$ASSOCIATION_ID" != "None" ]; then
        echo "Elastic IP is already associated with another instance. Disassociating..."
        aws ec2 disassociate-address --association-id "$ASSOCIATION_ID"
      fi

      # Assign the Elastic IP to the current instance
      aws ec2 associate-address --instance-id "$INSTANCE_ID" --allocation-id "$ALLOCATION_ID"
    '';
    
  };
in
{
  system.stateVersion = "23.05";


  users.users.alice = {
    isNormalUser = true;
    extraGroups = [ "wheel" ]; # Enable ‘sudo’ for the user.

  };
  # allow sudo without password for wheel
  security.sudo.wheelNeedsPassword = false;

  # port 22
  networking.firewall.allowedTCPPorts = [ 22 80 443 ];

  services.openssh = {
    enable = true;
    # require public key authentication for better security
    settings.PasswordAuthentication = false;
    settings.KbdInteractiveAuthentication = false;
    # settings.GatewayPorts = "yes";

  };

  users.users."alice".openssh.authorizedKeys.keys = [
    "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIK9tjvxDXYRrYX6oDlWI0/vbuib9JOwAooA+gbyGG/+Q robertwendt@Roberts-Laptop.local"
  ];


  # # use caddy to reverse proxy to metabase
  services.caddy = {
    enable = true;
    # 301 redirect flakery.dev to www.flakery.dev
    virtualHosts."flakery.dev".extraConfig = ''
      redir https://www.flakery.dev{uri}
    '';

  };

  systemd.services.assign-eip = {
    description = "Assign Elastic IP to instance";
    path = with pkgs; [ awscli2 curl ];
    serviceConfig.Type = "oneshot";
    serviceConfig.RemainAfterExit = true;
    serviceConfig.ExecStart = "${assignEIP}/bin/assign-eip";
    serviceConfig.RestartSec = 32; # Delay between retries
    # serviceConfig.StartLimitBurst = 16; # Number of retry attempts
    serviceConfig.StartLimitIntervalSec = 256; # Time window for retry attempts
    serviceConfig.Restart = "on-failure";

  };

  services.tailscale = {
    enable = true;
    authKeyFile = "/tsauthkey";
    extraUpFlags = [ "--ssh" "--hostname" "dash-redirect" ];
  };


  # Enable Flakes
  nix = {
    package = pkgs.nixFlakes;
    extraOptions = ''
      experimental-features = nix-command flakes
    '';
  };
}
