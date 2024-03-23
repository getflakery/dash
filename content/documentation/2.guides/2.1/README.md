# Create a Github Repo and Deploy Your Flake on Flakery

[[toc]]

In this tutorial, we will create a basic NixOS flake and deploy it on Flakery.

## Prerequisites

Before you begin, you will need to have the following installed:

- [Nix](https://nixos.org/download.html)
- [Nix Flakes](https://nixos.wiki/wiki/Flakes)
- [Git](https://git-scm.com/)

This guide also assumes that you have [Github](https://github.com) account. 

This guide also assumes that you have in your current directory a nix flake defining a NixOS configuration `hello-flakery`. Adjust this to suit your situation and refer to [these examples from the nix flake man page](https://nixos.org/manual/nix/unstable/command-ref/new-cli/nix3-flake.html#examples)

## Create a git repository and push your flake

Initialize a git repository and create an initial commit. 

```shell
git init
git add .
git commit -m "initial commit"
```

[Create a new repository on GitHub](https://github.com/new) and push your flake to the repository. 

```shell
git branch -M main
git remote add origin git@github.com:getflakery/basic-flake.git
git push -u origin main
```

::: tip
Replace `git@github.com:getflakery/basic-flake.git` with your repository URL.
:::

Now that you have created a flake and pushed it to a git repository, you can deploy it on Flakery.

## Deploy your Nixos Flake on Flakery

To deploy your flake on Flakery, you will need to create a new deployment. You can do this by visiting the [Flakery website](https://flakery.dev/flakes) and adding your flake to the input field. the url should look something like this: `github:$YOUR_USERNAME/basic-flake#hello-flakery`.

::: tip
Replace `$YOUR_USERNAME` with your Github username.
:::

![Alt text](./image-6.png)

Once you have added your flake, it will appear in the list of available flakes. You can click on the flake to view its details.


![Alt text](./image-7.png)

Once you have added your flake, you can click the "Create Deployment" button. This will create a new deployment of your flake.

![Alt text](./image-1.png)

after creating your deployment, you can view the details of your deployment.

![Alt text](./image-8.png)


![Alt text](./image-9.png)

After a few minutes, your deployment will be ready. You can then browse to the URL of your deployment to view your NixOS system.

