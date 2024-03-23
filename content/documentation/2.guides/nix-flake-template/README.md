# Using the Flakery Nix Flake Template

Flakery provides a nix flake template to for your convienience. This guide will assist you in using this template to deploy NixOS on Flakery. 

## Initialize a new Nix Flake using the Flakery Template

To initialize a new Nix Flake  in the current directoty, using the Flakery template, run the following command:

```sh
nix flake init -t github:getflakery/flakes#flakery
```

## Customize Your Flake's NixOS Configuration

to customize your Nix Flake's NixOS configuration, edit `configuration.nix`
file in the root of your directory. In this example we will add a caddy server to our NixOS configuration that will respond with "Hello, world!" deployed to the domain name assigned to your flakery instance. 

```nix{8-14}
{ config, pkgs, ... }:
let 
  flakeryDomain = builtins.readFile /metadata/flakery-domain;
in
{
  system.stateVersion = "23.05";

  services.caddy = {
    enable = true;
    virtualHosts."${flakeryDomain}".extraConfig = ''
      respond "Hello, world!"
    '';
  }; 
  networking.firewall.allowedTCPPorts = [ 80 443 ];
}
```

<!-- todo see blank, blank and blank for exapmles -->

## Deploy Your Nix Flake

see [Deploying a Nix Flake](guides/create-git-deploy-flakery/) for instructions on deploying your Nix Flake.

