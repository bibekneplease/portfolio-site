---
title: "EFTPOS & POS Connectivity Troubleshooting Guide"
slug: "eftpos-pos-connectivity"
category: "field_notes"
status: "draft"
author: "Bibek Chaudhary"
description: "A vendor-neutral diagnostic workflow for SIM-based and LAN-based payment terminals."
review_required: true
---

# EFTPOS & POS Connectivity Troubleshooting Guide

> **Editorial status: Draft for technical review.** This guide is a vendor-neutral field reference. It does not describe any specific employer, retailer, payment acquirer or customer environment.

Payment-terminal incidents are often reported as “EFTPOS is down” or “the register cannot take payments”. The symptom is clear to the store, but the fault may sit at several different layers: terminal power, cellular signal, Ethernet, local addressing, DNS, firewall policy, the payment provider or the application itself.

The fastest way to troubleshoot is to isolate the failing layer before changing configuration.

## 1. Start with impact and scope

Before touching the terminal, establish:

- Is one terminal affected, every terminal at one register, or the whole site?
- Are POS sales applications also affected, or only payment authorisation?
- Is the issue constant, intermittent, or limited to particular times?
- Did anything change recently: cabling, switch ports, router, SIM, carrier, firewall policy, terminal replacement or store network maintenance?
- Is there an approved outage or provider incident?

Record the site identifier, terminal identifier, approximate start time, error text and actions already attempted. Use approved asset and incident-management records. Do not record cardholder data, PINs, magnetic-stripe data, security codes or screenshots containing payment details.

## 2. Identify the connection type

### SIM / cellular-connected terminal

The terminal uses a mobile network connection, commonly through an embedded or removable SIM.

Check:

1. Confirm the terminal is powered and has completed startup.
2. Read the displayed mobile-network indicator and any signal-strength status.
3. Check whether the device reports SIM missing, SIM inactive, network unavailable or registration failure.
4. Confirm the terminal is in an area with adequate carrier coverage; metal cabinets, thick walls and equipment rooms can weaken reception.
5. If permitted by the device procedure, perform one controlled restart and allow the modem time to register.
6. Check with the terminal provider or carrier whether there is a known coverage, SIM provisioning or network incident.

**Interpretation:** No signal or failed network registration points towards radio coverage, SIM provisioning or carrier registration. Good signal does not prove that the payment service is reachable; continue to provider and application checks.

Do not remove or swap a SIM unless the approved support procedure authorises it. A SIM move can introduce provisioning, security and asset-tracking issues.

### LAN / Ethernet-connected terminal

The terminal uses a wired connection to the store network.

Check:

1. Confirm the Ethernet cable is firmly seated at both ends.
2. Check link/activity indicators on the terminal, dock (if applicable) and switch.
3. Inspect the cable for damage and verify that the correct outlet and patching are being used.
4. If approved, test with a known-good cable or an approved spare port. Record the original port before changing anything.
5. Check whether the switch port is enabled and whether the expected VLAN and port profile are applied.
6. Review the terminal's network status for an IP address, subnet mask, default gateway and DNS servers.

**Interpretation:** No link light suggests a physical-layer, port or negotiation issue. A link light with no valid address suggests a DHCP, VLAN or endpoint configuration issue. An assigned address still does not prove that the payment host is reachable.

## 3. Follow the network path

Use the terminal's approved diagnostics or the authorised network-management tools. Do not install unapproved utilities or alter a production payment device.

| Layer | What to verify | Typical clue |
|---|---|---|
| Physical | Power, cable, port, link state or cellular registration | No link / no signal |
| Addressing | IP address, subnet, DHCP lease and gateway | Missing or self-assigned address |
| Local routing | Correct VLAN, gateway and route | Local network works only partially |
| Name resolution | Configured DNS and provider hostname resolution, where supported | Hostname lookup failure |
| Egress policy | Approved firewall rules, proxy requirements and provider allowlists | Local network works but service is unreachable |
| Payment service | Acquirer/provider status and terminal/application status | Network appears healthy but authorisation fails |

### DHCP and IP addressing

For LAN terminals, verify that the device receives an address from the intended scope and that the subnet and gateway match the approved design.

Potential causes include:

- DHCP scope exhaustion.
- Incorrect access VLAN or switch-port profile.
- A disabled or mispatched switch port.
- Incorrect static addressing.
- DHCP relay or helper-address problems.
- A stale reservation or duplicate IP address.

Do not assign a random static IP address. Use the approved addressing plan and involve the network team when scope, relay or VLAN changes are required.

### DNS and upstream reachability

Where the device or approved diagnostic tooling supports it, verify that the configured DNS service can resolve the payment provider's documented hostname. Confirm upstream routing and any required firewall or allowlist policy with the network team and payment provider.

A successful ping is not proof that a payment transaction path is healthy. ICMP may be blocked while the required application traffic works, or ping may succeed while the payment service itself is unavailable. Use provider-approved diagnostics and documented destination/port requirements; never guess or open broad firewall access.

## 4. Separate a network fault from a payment-service fault

If the terminal has a valid connection and the store network appears healthy, check:

- Whether the payment provider or acquirer reports a service incident.
- Whether the terminal is correctly provisioned and associated with the intended merchant/site.
- Whether the terminal displays a specific host, authorisation or configuration error.
- Whether the issue affects all payment types or only a particular workflow.
- Whether the POS application and terminal integration are both healthy.

Use only approved test procedures. Do not initiate a live transaction simply to test connectivity unless the merchant/provider procedure explicitly authorises it. Never use a customer's card for troubleshooting.

## 5. A practical decision path

1. **One terminal only:** inspect its power, cable/SIM state and device status; compare with a known-good terminal only where policy permits.
2. **Several terminals on one register:** check the register, local switch, dock or shared cabling.
3. **All terminals at one site:** investigate shared LAN, WAN, cellular coverage, firewall and provider status.
4. **Multiple sites:** check provider/carrier status and central network services before treating each store as an independent device fault.
5. **Network healthy, authorisations failing:** escalate to the payment provider/acquirer with timestamps, terminal identifiers and sanitised error details.

This is a scoping aid, not a substitute for the organisation's incident severity and escalation matrix.

## 6. Safe recovery and escalation

Before making a change:

- Confirm authority and the relevant change procedure.
- Capture the current state and affected asset/port details.
- Make one controlled change at a time.
- Verify service using the approved operational test.
- Record the result and any rollback action.

Escalate with a concise evidence bundle:

- Site and terminal identifiers (not card data).
- Connection type: cellular or LAN.
- Start time and time zone.
- Exact sanitised error text.
- Scope and business impact.
- Link state / signal status and IP configuration where available.
- Relevant switch port, VLAN or network ticket reference.
- Provider incident reference, if available.
- Checks completed, changes made and results.

## 7. Common troubleshooting mistakes

- Rebooting repeatedly without recording the initial symptom.
- Replacing a terminal before checking the shared network path.
- Treating a link light or strong cellular signal as proof of end-to-end service.
- Changing VLANs, static IPs or firewall rules without approval.
- Assuming ping success proves payment authorisation will work.
- Testing with a customer's payment card.
- Capturing or sharing cardholder data in tickets, chat or screenshots.

## Field checklist

- [ ] Confirm impact, scope and start time.
- [ ] Identify SIM/cellular or LAN connection.
- [ ] Check power, physical link or cellular registration.
- [ ] Verify IP, subnet, gateway and DNS where applicable.
- [ ] Check VLAN, DHCP and approved upstream policy.
- [ ] Check payment provider/acquirer service status.
- [ ] Perform only an approved service test.
- [ ] Record sanitised evidence and escalate to the correct resolver group.

---

**Technical review note:** Validate all device-specific menu paths, carrier indicators, provider destinations, ports and transaction-test procedures against the relevant vendor/acquirer documentation before publication. Those details vary by terminal model, payment provider and network design.

**Security note:** Payment environments are sensitive. Follow the organisation's PCI DSS controls, least-privilege requirements, change-management process and incident-handling procedures. Never place cardholder data or secrets in this guide or its supporting evidence.
