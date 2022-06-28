/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('getServerMaxMoney')
    ns.disableLog('getServerSecurityLevel')
    ns.disableLog('getServerMinSecurityLevel')
    ns.disableLog('getHackingLevel')
    ns.disableLog('getServerMoneyAvailable')

    const target = ns.args.length > 0 ? ns.args[0] : await ns.getHostname()
    const startScriptMessage = `starting h4ck on target "${target}"..`
    ns.print(startScriptMessage)

    var moneyThreshold = ns.getServerMaxMoney(target) * 0.75
    var securityThreshold = Math.min(ns.getServerMinSecurityLevel(target) + 5, ns.getHackingLevel())

    while (true) {
        if (ns.getServerSecurityLevel(target) > securityThreshold) {
            await ns.weaken(target)
        } else if (ns.getServerMoneyAvailable(target) < moneyThreshold) {
            await ns.grow(target)
        } else {
            await ns.hack(target)
        }
    }
}