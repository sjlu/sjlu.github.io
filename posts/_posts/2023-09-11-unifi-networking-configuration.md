---
layout: post
title: "UniFi Networking Configuration"
description: "Step by step networking settings with UniFi"
tags: []
---

*draft*

Part 2: Now that I have all this fancy networking equipment in my coat closet, I'm able to create my networks. I'll show you exactly how I've configured my network.

One thing to keep in mind:

I use two separate ISPs for internet access. Verizon Fios as my fiber-line (WAN1) and Natural Wireless as my backup (WAN2). Natural Wireless is a Point-to-Point internet service that my building uses and serves as a great secondary service for lower cost.

We're going to create the following networks:

* Default: All of our main devices go here
* Guest: Self explanatory
* IoT: Anything that runs our home and is low-bandwidth

We'll also go over certain Traffic & Firewall rules as we create certain isolation across these networks.

### VLANs

__VLANs__ provide the ability to separate your devices on different IP ranges (e.g. 192.168.2.X and 192.168.3.X). By default, VLANs can talk between one another. This is called __Inter-VLAN__. Traffic that moves within a VLAN is called __Intra-VLAN__. 

For the most part, I choose all the default options when creating a new network in UniFi. With the exception of my Guest network where I have Network Isolation turned on.

![Network isolation option](/images/unifi-networking-configuration/CleanShot_2023-09-13_at_10.00.48-1F01AOjpUl0wSIoZpMxOsD.webp)

FYI: Inter-VLAN traffic requires CPU on your Router (e.g. the UDM SE). On the spec sheet, it can move traffic at 3 Gbps but some report slower. Turning on traffic introspection like IDS/IDP will also reduce this rate too.

FYI #2: Though some UniFi switches do include L3 capabilities, it will not respect your firewall rules. You can SSH and modify ACL rules if you're experienced enough.

### WiFi

For each Network, you can create a different WiFi SSID. For every SSID, I assign a new WiFi network SSID and a different password. I use all the default options except for IoT where I only have 2.4 GHz enabled. Because IoT devices do not have high bandwidth requirements, it keeps the 5 GHz band clean and free for your laptops, phones, etc. to use.

![IoT 2.4GHz only](/images/unifi-networking-configuration/CleanShot_2023-09-13_at_10.15.05-6ATDKwRyfXDf8yiQEAJEFP.webp)

### Dual ISPs

If you utilize two ISPs, you can use Traffic Routes to direct traffic from your primary ISP to your secondary. Useful if you want to keep your traffic separate. 

![Traffic redirect](/images/unifi-networking-configuration/CleanShot_2023-09-13_at_10.26.39-6RVSatTGqBRVgZTVwYxAXb.webp)

You can also do distributed load settings but I suggest Failover Only and if needed, direct specific devices or networks to the secondary ISP as mentioned before.

![Internet settings](/images/unifi-networking-configuration/CleanShot_2023-09-13_at_10.29.03-1s0enPa2QNpBicwTMelBnA.webp)

### IDP/IPS

*different IDP/IPS settings*

### Firewall Rules

*prevent traffic coming out of IoT but allow Default to go into IoT*