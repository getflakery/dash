# Adding Flakery to an Existing NixOS Configuration

In order to add Flakery to an exiting flake you need to:

1. Add the Flakery nix flake to your flake inputs
2. Add the Flakery nixos module to your nixos module's imports

```nix{6,9,14}
{
  description = "A very basic flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flakery.url = "github:getflakery/flakery";
  };

  outputs = { self, nixpkgs, flakery }: {

    nixosConfigurations.hello-flakery = nixpkgs.lib.nixosSystem {
      system = "x86_64-linux";
      modules = [
        flakery.nixosModules.flakery
        ./configuration.nix
      ];
    };

  };
}
```