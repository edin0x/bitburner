/** @param {NS} ns */
export async function main(ns) {
	// start hacknet upgrade script
	ns.exec('upgrade-hacknet.js', 'home')

	// propagate hack script to all machines
	ns.exec('hack-propagate.js', 'home')
}