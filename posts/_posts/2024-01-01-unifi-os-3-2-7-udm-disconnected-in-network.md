---
layout: post
title: "UniFi OS 3.2.7 UDM disconnected in Network"
description: "undefined"
tags: []
---

Getting this one out for visibility. I was running into issues where my UDM SE was showing as disconnected in Unifi Network after updating to UniFi OS 3.2.7 / UniFi network 8.0.24.

![CleanShot 2024-01-01 at 18.15.32@2x clean](/images/unifi-os-3-2-7-udm-disconnected-in-network/CleanShot_2024-01-01_at_18.15.32_2x_clean-6eKS6vaogWCszDvoChPmma.webp)

It seems like there's an issue with this update where WAN port configurations were completely botched during a migration. [Link 1](https://community.ui.com/questions/WAN-not-working-after-Unifi-OS-updated-to-3-2-7/c5dc9e52-a6e9-4209-87cc-7a920a78d69b?page=1) [Link 2](https://community.ui.com/questions/Cant-connect-PPPOE/771bbde4-5455-45cd-82d5-553c5572a97c)

To resolve this, you need to open your iOS app. Go to your UDM, select your ports, and configure them to be WAN ports. After updating, the UDM shows right back up in your Network. 

It also seems that if you had a Static IP WAN configuration, you'll need to add this back in too.