#!/usr/bin/env bash
# This file creates an Amazon EKS cluster

# Assumes that the eksctl command line utility is installed

eksctl create cluster \
--name production \
--region us-east-2 \
--nodegroup-name standard-workers \
--node-type t2.micro \
--nodes 3 \
--nodes-min 3 \
--nodes-max 5 \
--ssh-access \
--ssh-public-key eks \
--managed