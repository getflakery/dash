{
  description = "basic flake-utils";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  inputs.flake-utils.url = "github:numtide/flake-utils";
  inputs.flakery.url = "github:getflakery/flakes";


  outputs = { self, nixpkgs, flake-utils, flakery, ... }:
    (flake-utils.lib.eachDefaultSystem
      (system:
        let
          pkgs = import nixpkgs {
            inherit system;
          };
          devshell = pkgs.mkShell {
            buildInputs = with pkgs; [
              nodePackages.pnpm
              nodePackages.yarn
              nodejs
              turso-cli
              awscli2
              bun
              terraform
            ];
          };
        in
        {
          devShells.default = devshell;


          packages.nixosConfigurations.flakery = nixpkgs.lib.nixosSystem {
            system = "x86_64-linux";
            modules = [
              flakery.nixosModules.flakery
              flakery.nixosConfigurations.base
              ./configuration.nix
            ];
          };

          packages.nixosConfigurations.reverse-proxy = nixpkgs.lib.nixosSystem {
            system = "x86_64-linux";
            modules = [
              flakery.nixosModules.reverse-proxy
              flakery.nixosConfigurations.base
              ./reverse-proxy.nix
            ];
          };

          packages.nixosConfigurations.flakery-config-only = nixpkgs.lib.nixosSystem {
            system = "x86_64-linux";
            modules = [
              ./configuration.nix
            ];
          };

          packages.test = pkgs.testers.runNixOSTest
            {
              name = "test builds";
              nodes = {
                machine1 = ./configuration.nix;
                machine2 = ./reverse-proxy.nix;

              };
              testScript = ''
                start_all();
              '';
            };
        })


    );
}
