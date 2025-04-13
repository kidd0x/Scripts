const { Client, IntentsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const net = require('net');
const dns = require('dns');
const ping = require('ping');
const { promisify } = require('util');
const lookup = promisify(dns.lookup);

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ]
});

const token = 'your_discord_bot_token_here';
const activeScans = new Map();
const PORT_SCAN_LIMIT = 1000;
const PORT_SCAN_TIMEOUT = 500;

// Comprehensive list of known services
const services = {
    1: 'TCPMUX', 5: 'RJE', 7: 'ECHO', 9: 'DISCARD', 11: 'SYSTAT', 13: 'DAYTIME',
    17: 'QOTD', 18: 'MSP', 19: 'CHARGEN', 20: 'FTP Data', 21: 'FTP Control',
    22: 'SSH', 23: 'Telnet', 25: 'SMTP', 37: 'TIME', 42: 'Nameserver', 43: 'WHOIS',
    49: 'TACACS', 53: 'DNS', 67: 'DHCP Server', 68: 'DHCP Client', 69: 'TFTP',
    70: 'Gopher', 79: 'Finger', 80: 'HTTP', 88: 'Kerberos', 102: 'ISO-TSAP',
    110: 'POP3', 111: 'RPCbind', 113: 'Ident', 119: 'NNTP', 123: 'NTP',
    135: 'MS RPC', 137: 'NetBIOS NS', 138: 'NetBIOS DGM', 139: 'NetBIOS SSN',
    143: 'IMAP', 161: 'SNMP', 162: 'SNMP Trap', 179: 'BGP', 194: 'IRC',
    201: 'AppleTalk', 264: 'BGMP', 318: 'TSP', 381: 'HP OpenView', 383: 'HP OpenView',
    389: 'LDAP', 411: 'Direct Connect', 412: 'Direct Connect', 427: 'SLP',
    443: 'HTTPS', 445: 'Microsoft DS', 464: 'Kerberos', 465: 'SMTPS',
    497: 'Dantz Retrospect', 500: 'ISAKMP', 512: 'rexec', 513: 'rlogin',
    514: 'syslog', 515: 'LPD', 520: 'RIP', 521: 'RIPng', 540: 'UUCP',
    548: 'AFP', 554: 'RTSP', 563: 'NNTPS', 587: 'SMTP Submission',
    591: 'FileMaker', 593: 'MS RPC over HTTP', 631: 'IPP', 636: 'LDAPS',
    639: 'MSDP', 646: 'LDP', 691: 'MS Exchange', 860: 'iSCSI', 873: 'rsync',
    902: 'VMware Server', 989: 'FTPS Data', 990: 'FTPS Control', 993: 'IMAPS',
    995: 'POP3S', 1025: 'MS RPC', 1026: 'MS RPC', 1027: 'MS RPC', 1028: 'MS RPC',
    1029: 'MS RPC', 1080: 'SOCKS', 1194: 'OpenVPN', 1214: 'Kazaa', 1241: 'Nessus',
    1311: 'Dell OpenManage', 1337: 'WASTE', 1433: 'MS SQL', 1434: 'MS SQL Monitor',
    1512: 'WINS', 1521: 'Oracle DB', 1723: 'PPTP', 1725: 'Steam',
    1741: 'CiscoWorks 2000', 1755: 'MS Media Server', 1812: 'RADIUS',
    1813: 'RADIUS Accounting', 1863: 'MSN', 1900: 'UPnP', 2000: 'Cisco SCCP',
    2049: 'NFS', 2082: 'cPanel', 2083: 'cPanel SSL', 2086: 'WHM', 2087: 'WHM SSL',
    2095: 'cPanel Webmail', 2096: 'cPanel Webmail SSL', 2100: 'Oracle XDB',
    2222: 'DirectAdmin', 2302: 'Halo', 2483: 'Oracle DB SSL', 2484: 'Oracle DB SSL',
    2967: 'Symantec AV', 3000: 'Ruby on Rails', 3074: 'Xbox Live', 3128: 'Squid',
    3306: 'MySQL', 3389: 'RDP', 3396: 'Novell NDPS', 3689: 'DAAP', 3690: 'SVN',
    3724: 'WoW', 3784: 'Ventrilo', 3785: 'Ventrilo', 4333: 'mSQL', 4444: 'Metasploit',
    4500: 'IPSec NAT-T', 4662: 'eMule', 4664: 'Google Desktop', 4672: 'eMule',
    4899: 'Radmin', 5000: 'UPnP', 5001: 'Synology', 5004: 'RTP', 5005: 'RTP',
    5050: 'Yahoo! Messenger', 5060: 'SIP', 5190: 'AIM', 5222: 'XMPP',
    5223: 'XMPP SSL', 5269: 'XMPP Server', 5298: 'XMPP', 5353: 'mDNS',
    5432: 'PostgreSQL', 5500: 'VNC', 5555: 'Freeciv', 5631: 'pcAnywhere',
    5666: 'Nagios', 5800: 'VNC HTTP', 5900: 'VNC', 6000: 'X11', 6001: 'X11',
    6112: 'Battle.net', 6129: 'DameWare', 6257: 'WinMX', 6346: 'Gnutella',
    6500: 'GameSpy Arcade', 6566: 'SANE', 6588: 'AnalogX', 6665: 'IRC',
    6666: 'IRC', 6667: 'IRC', 6668: 'IRC', 6669: 'IRC', 6679: 'IRC SSL',
    6697: 'IRC SSL', 6881: 'BitTorrent', 6882: 'BitTorrent', 6883: 'BitTorrent',
    6884: 'BitTorrent', 6885: 'BitTorrent', 6886: 'BitTorrent', 6887: 'BitTorrent',
    6888: 'BitTorrent', 6889: 'BitTorrent', 6890: 'BitTorrent', 6891: 'BitTorrent',
    6892: 'BitTorrent', 6901: 'BitTorrent', 6969: 'BitTorrent', 6970: 'BitTorrent',
    7212: 'GhostSurf', 7648: 'CU-SeeMe', 8000: 'HTTP Alternate', 8008: 'HTTP Alternate',
    8080: 'HTTP Proxy', 8081: 'HTTP Proxy', 8087: 'HTTP Proxy', 8088: 'HTTP Proxy',
    8090: 'HTTP Proxy', 8118: 'Privoxy', 8200: 'VMware Server', 8222: 'VMware Server',
    8500: 'Adobe ColdFusion', 8767: 'TeamSpeak', 8888: 'HTTP Alternate',
    9000: 'Hadoop', 9001: 'Tor', 9043: 'WebSphere', 9060: 'WebSphere',
    9080: 'WebSphere', 9090: 'WebSphere', 9091: 'Transmission', 9100: 'Printer',
    9119: 'MXit', 9290: 'HP JetDirect', 9418: 'Git', 9535: 'mRemote', 9800: 'WebDAV',
    9898: 'Dabber', 9999: 'Urchin', 10000: 'Webmin', 10001: 'Ubiquiti',
    10113: 'NetIQ', 10114: 'NetIQ', 10115: 'NetIQ', 10116: 'NetIQ', 11371: 'OpenPGP',
    12035: 'Second Life', 12036: 'Second Life', 12345: 'NetBus', 13720: 'NetBackup',
    13721: 'NetBackup', 14567: 'Battlefield', 15118: 'Dipnet', 19226: 'AdminSecure',
    19638: 'Ensim', 20000: 'DNP', 24800: 'Synergy', 25999: 'Xfire', 27015: 'Source Engine',
    27017: 'MongoDB', 27374: 'Sub7', 28960: 'Call of Duty', 29900: 'Nintendo Wi-Fi',
    31337: 'Back Orifice', 33434: 'traceroute', 37777: 'Digital Video Recorder',
    40000: 'SafetyNET', 47808: 'BACnet', 49151: 'Reserved'
};

// Manual private IP check
function isPrivateIP(ip) {
    if (!net.isIP(ip)) return false;
    
    if (net.isIPv4(ip)) {
        const parts = ip.split('.').map(Number);
        return (
            parts[0] === 10 || 
            (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || 
            (parts[0] === 192 && parts[1] === 168) ||
            parts[0] === 127
        );
    } else {
        return (
            ip.startsWith('fc00:') ||
            ip.startsWith('fd00:') ||
            ip === '::1'
        );
    }
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith('!info')) {
        const args = message.content.split(' ');
        if (args.length < 2) {
            return message.reply('Usage: `!info <ip>`\nExample: `!info 93.114.82.21`');
        }

        const target = args[1];
        
        try {
            const ip = await validateInput(target);
            if (!ip) return message.reply('Invalid IP address or hostname');

            const scanId = `${message.id}-${Date.now()}`;
            const progressMsg = await message.reply(`🔍 Starting comprehensive scan of ${ip}...`);

            activeScans.set(scanId, {
                ip,
                userId: message.author.id,
                startTime: Date.now(),
                ports: {},
                currentPage: 0,
                pages: [],
                showOnlyOpen: false
            });

            startComprehensiveScan(scanId, progressMsg);
            
        } catch (error) {
            console.error(error);
            message.reply(`Error: ${error.message}`);
        }
    }
});

async function validateInput(input) {
    if (net.isIP(input)) return input;
    
    try {
        const { address } = await lookup(input);
        return address;
    } catch {
        return null;
    }
}

async function startComprehensiveScan(scanId, progressMsg) {
    const scanData = activeScans.get(scanId);
    if (!scanData) return;

    try {
        // Get basic IP info
        const ipInfo = {
            ip: scanData.ip,
            hostname: null,
            isPrivate: isPrivateIP(scanData.ip),
            ping: null
        };

        // Try reverse DNS
        try {
            const hostnames = await promisify(dns.reverse)(scanData.ip);
            ipInfo.hostname = hostnames[0];
        } catch {}

        // Ping the IP
        try {
            const pingResult = await ping.promise.probe(scanData.ip);
            ipInfo.ping = pingResult.alive ? `${pingResult.time}ms` : 'unreachable';
        } catch {}

        scanData.ipInfo = ipInfo;
        
        // Scan common ports first
        const commonPorts = Object.keys(services).map(Number);
        await scanPorts(scanId, commonPorts, progressMsg);
        
        // Scan additional random ports
        const portsToScan = Math.min(PORT_SCAN_LIMIT - commonPorts.length, 50);
        if (portsToScan > 0) {
            const randomPorts = getRandomPorts(portsToScan, commonPorts);
            await scanPorts(scanId, randomPorts, progressMsg);
        }

        organizeResults(scanId);
        await showResultsPage(scanId, 0, progressMsg);
        
    } catch (error) {
        console.error(`Scan ${scanId} failed:`, error);
        progressMsg.edit(`Scan failed: ${error.message}`);
        activeScans.delete(scanId);
    }
}

function getRandomPorts(count, exclude = []) {
    const ports = [];
    const excludeSet = new Set(exclude);
    
    while (ports.length < count) {
        const port = Math.floor(Math.random() * 65535) + 1;
        if (!excludeSet.has(port)) {
            ports.push(port);
            excludeSet.add(port);
        }
    }
    
    return ports;
}

async function scanPorts(scanId, ports, progressMsg) {
    const scanData = activeScans.get(scanId);
    if (!scanData) return;

    const batchSize = 20;
    for (let i = 0; i < ports.length; i += batchSize) {
        const batch = ports.slice(i, i + batchSize);
        
        // Update progress
        const scanned = Object.keys(scanData.ports).length;
        const total = ports.length + scanned;
        await progressMsg.edit(`🔍 Scanning ${scanData.ip} (${scanned + batch.length}/${total} ports)...`);
        
        // Scan batch in parallel
        await Promise.all(batch.map(port => scanPort(scanId, port)));
    }
}

async function scanPort(scanId, port) {
    const scanData = activeScans.get(scanId);
    if (!scanData || scanData.ports[port]) return;

    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(PORT_SCAN_TIMEOUT);

        scanData.ports[port] = {
            port,
            status: 'closed',
            service: services[port] || null,
            banner: null
        };

        socket.on('connect', () => {
            scanData.ports[port].status = 'open';
            socket.destroy();
            identifyService(scanId, port).finally(resolve);
        });

        socket.on('timeout', () => {
            socket.destroy();
            resolve();
        });

        socket.on('error', () => {
            socket.destroy();
            resolve();
        });

        socket.connect(port, scanData.ip);
    });
}

async function identifyService(scanId, port) {
    const scanData = activeScans.get(scanId);
    if (!scanData || scanData.ports[port].status !== 'open') return;

    try {
        // Try to get service banner
        const banner = await getBanner(scanData.ip, port);
        if (banner) scanData.ports[port].banner = banner;

        // Special handling for HTTP
        if ([80, 443, 8080, 8443].includes(port)) {
            const httpInfo = await getHttpInfo(scanData.ip, port);
            if (httpInfo) {
                scanData.ports[port].service = 'HTTP Server';
                scanData.ports[port].httpInfo = httpInfo;
            }
        }
    } catch (error) {
        console.error(`Error identifying service on port ${port}:`, error);
    }
}

async function getBanner(ip, port) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(2000);

        let banner = '';
        socket.on('data', (data) => {
            banner += data.toString().trim();
            if (banner.length > 200) {
                banner = banner.substring(0, 200) + '...';
                socket.destroy();
            }
        });

        socket.on('close', () => resolve(banner || null));
        socket.on('timeout', () => socket.destroy());
        socket.on('error', () => resolve(null));

        socket.connect(port, ip);
    });
}

async function getHttpInfo(ip, port) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(2000);

        let response = '';
        socket.on('data', (data) => {
            response += data.toString();
            if (response.includes('\r\n\r\n')) {
                const headers = response.split('\r\n\r\n')[0];
                const serverMatch = headers.match(/Server: (.+)/i);
                const titleMatch = response.match(/<title>(.*?)<\/title>/i);
                
                socket.destroy();
                resolve({
                    server: serverMatch ? serverMatch[1] : 'Unknown',
                    title: titleMatch ? titleMatch[1] : 'No title'
                });
            }
        });

        socket.on('timeout', () => socket.destroy());
        socket.on('error', () => resolve(null));

        socket.connect(port, ip, () => {
            socket.write(`HEAD / HTTP/1.1\r\nHost: ${ip}\r\nConnection: close\r\n\r\n`);
        });
    });
}

function organizeResults(scanId) {
    const scanData = activeScans.get(scanId);
    if (!scanData) return;

    // Convert ports object to array and sort
    let portsArray = Object.values(scanData.ports)
        .sort((a, b) => a.port - b.port);

    // Filter if only open ports should be shown
    if (scanData.showOnlyOpen) {
        portsArray = portsArray.filter(port => port.status === 'open');
    }

    // Split into pages (10 ports per page)
    const pages = [];
    for (let i = 0; i < portsArray.length; i += 10) {
        pages.push(portsArray.slice(i, i + 10));
    }

    scanData.pages = pages;
}

async function showResultsPage(scanId, pageIndex, message) {
    const scanData = activeScans.get(scanId);
    if (!scanData || !scanData.pages[pageIndex]) return;

    scanData.currentPage = pageIndex;
    const page = scanData.pages[pageIndex];
    const totalPages = scanData.pages.length;

    // Create embed
    const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(`${scanData.showOnlyOpen ? 'Open Ports' : 'All Ports'} Scan for ${scanData.ip}`)
        .setDescription(
            `Showing ${scanData.showOnlyOpen ? 'open' : 'all'} ports ` +
            `${pageIndex * 10 + 1}-${pageIndex * 10 + page.length} of ` +
            `${scanData.showOnlyOpen ? 
                Object.values(scanData.ports).filter(p => p.status === 'open').length : 
                Object.keys(scanData.ports).length}`
        )
        .addFields(
            {
                name: 'Basic Information',
                value: `Hostname: ${scanData.ipInfo.hostname || 'Unknown'}\n` +
                       `Ping: ${scanData.ipInfo.ping || 'Unknown'}\n` +
                       `Private IP: ${scanData.ipInfo.isPrivate ? 'Yes' : 'No'}`,
                inline: false
            }
        );

    // Add port information
    page.forEach(portInfo => {
        let value = `Status: ${portInfo.status === 'open' ? '✅ Open' : '❌ Closed'}`;
        if (portInfo.service) value += `\nService: ${portInfo.service}`;
        if (portInfo.banner) value += `\nBanner: \`${portInfo.banner}\``;
        if (portInfo.httpInfo) value += `\nWeb Server: ${portInfo.httpInfo.server}\nTitle: ${portInfo.httpInfo.title}`;

        embed.addFields({
            name: `Port ${portInfo.port}`,
            value: value,
            inline: true
        });
    });

    // Create navigation buttons
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`scan_prev|${scanId}|${pageIndex}`)
                .setLabel('◀️ Previous')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(pageIndex === 0),
            new ButtonBuilder()
                .setCustomId(`scan_next|${scanId}|${pageIndex}`)
                .setLabel('Next ▶️')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(pageIndex === totalPages - 1),
            new ButtonBuilder()
                .setLabel(`Page ${pageIndex + 1}/${totalPages}`)
                .setCustomId('page_info')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
        );

    // Add filter button
    const filterRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`filter_open|${scanId}|${pageIndex}`)
                .setLabel(scanData.showOnlyOpen ? 'Show All Ports' : 'Show Only Open')
                .setStyle(scanData.showOnlyOpen ? ButtonStyle.Success : ButtonStyle.Danger)
        );

    await message.edit({
        content: `📊 Scan results for ${scanData.ip}`,
        embeds: [embed],
        components: [row, filterRow]
    });
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    const [action, scanId, pageIndex] = interaction.customId.split('|');
    const scanData = activeScans.get(scanId);
    
    if (!scanData || scanData.userId !== interaction.user.id) {
        return interaction.reply({
            content: 'This scan session has expired or belongs to another user.',
            ephemeral: true
        });
    }

    if (action === 'filter_open') {
        // Toggle the filter
        scanData.showOnlyOpen = !scanData.showOnlyOpen;
        // Reorganize results with the new filter
        organizeResults(scanId);
        // Show first page of filtered results
        await showResultsPage(scanId, 0, interaction.message);
        return;
    }

    let newPage = parseInt(pageIndex);
    if (action === 'scan_prev') newPage--;
    if (action === 'scan_next') newPage++;

    // Boundary check
    newPage = Math.max(0, Math.min(newPage, scanData.pages.length - 1));

    await showResultsPage(scanId, newPage, interaction.message);
    await interaction.deferUpdate();
});

client.login(token);
