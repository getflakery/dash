{
  description = "basic flake-utils";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-23.11-darwin";
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
              nodePackages_latest.vercel
              podman
              qemu
            ];
          };
          flakery = pkgs.lib.nixosSystem {
            system = "x86_64-linux";
            modules = [
              flakery.nixosModules.flakery
              ./configuration.nix
            ];
          };
        in
        {
          devShells.default = devshell;


          packages.nixosConfigurations.flakery = flakery;
          packages.test = pkgs.testers.runNixOSTest
            {
              name = "test builds";
              nodes = {
                machine1 = ./configuration.nix;
              };
              testScript = ''
                start_all();
              '';
            };
        })


    );
}
