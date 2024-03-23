# Connect to a Flakery Instance via SSH

In order to connect to a flakery instance via SSH, we will need to edit the nixos configuration to allow SSH access, and then connect to the instance using the `ssh` command. This guide will walk you through the process of connecting to a flakery instance via SSH, and editing the nixos configuration to allow SSH access.

## Prequisites 

This guide assumes that you already have a nix flake that you would like to connect to via SSH. If you do not have a nix flake, see [Using the Flakery Nix Flake Template](/guides/nix-flake-template) for instructions on how to create a new nix flake using the flakery template. If instead, you'd just like to create one in the current directoy, run the following command:

```sh
nix flake init -t github:getflakery/flakes#flakery
```

## Edit Your NixOS Configuration to Allow SSH Access

### Create a User for SSH Access

it is a good security practice to use a non root user to ssh into your flakery instance. To create a user for SSH access, add the following to your `configuration.nix` file:

```nix{8-13}
{ config, pkgs, ... }:
let 
  flakeryDomain = builtins.readFile /metadata/flakery-domain;
in
{
  system.stateVersion = "23.05";

  users.users.flakery = {
    isNormalUser = true;
    extraGroups = [ "wheel" ]; # Enable ‘sudo’ for the user.
  };
  # allow sudo without password for wheel
  security.sudo.wheelNeedsPassword = false;

}
```

this creates the `flakery` user and allows `sudo` without a password.

### Enable the OpenSSH Service

to enable the openssh service, add the following to your `configuration.nix` file:

```nix{15-20}
{ config, pkgs, ... }:
let 
  flakeryDomain = builtins.readFile /metadata/flakery-domain;
in
{
  system.stateVersion = "23.05";

  users.users.flakery = {
    isNormalUser = true;
    extraGroups = [ "wheel" ]; # Enable ‘sudo’ for the user.
  };
  # allow sudo without password for wheel
  security.sudo.wheelNeedsPassword = false;
  
  services.openssh = {
    enable = true;
    # require public key authentication for better security
    settings.PasswordAuthentication = false;
    settings.KbdInteractiveAuthentication = false;
  };

}
```

this enables the openssh service and requires public key authentication for better security.

### Add Your SSH Public Key to the Flakery Flake

If you don't already have an ssh key, you can generate one with the following command:

```shell
ssh-keygen 
```

this will generate a new ssh key in your `~/.ssh` directory. You can then add this key to your flake by editing the `configuration.nix` file 

```nix{22-25}
{ config, pkgs, ... }:
let 
  flakeryDomain = builtins.readFile /metadata/flakery-domain;
in
{
  system.stateVersion = "23.05";

  users.users.flakery = {
    isNormalUser = true;
    extraGroups = [ "wheel" ]; # Enable ‘sudo’ for the user.
  };
  # allow sudo without password for wheel
  security.sudo.wheelNeedsPassword = false;
  
  services.openssh = {
    enable = true;
    # require public key authentication for better security
    settings.PasswordAuthentication = false;
    settings.KbdInteractiveAuthentication = false;
  };

  users.users."flakery".openssh.authorizedKeys.keys = [
    # replace with your ssh key 
    "ssh-ed25519 NOTAREALKEYBUTTHISISWHEREYOURSSHOULDBEdslkfjsoi3cjnefoODIUFNI0JDNCKL+" 
  ];

}
```

this adds your ssh key to the flake for the `flakery` user.

## Deploy Your Nix Flake using Flakery

see [Deploying a Nix Flake](/guides/deploying-a-nix-flake) for instructions on deploying your Nix Flake.

## Connect to Your Flakery Instance via SSH

to connect to your flakery instance via ssh, run the following command:

```shell
ssh flakery@<flakery-domain>
```

replace `<flakery-domain>` with the domain name assigned to your flakery instance.