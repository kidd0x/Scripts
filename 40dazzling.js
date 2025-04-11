const { Client, GatewayIntentBits, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Configuration
const BOT_TOKEN = 'your_discord_bot_token';
const SPIN_DELAY = 300; // Time between reel stops
const REEL_ROWS = 4; // 4 rows per reel (like real 40 Dazzling Hot)
const REELS = 5; // 5 reels
const PAYLINES = 40; // 40 paylines

// Enhanced slot symbols with classic fruit machine emojis and weights
const SLOT_SYMBOLS = [
    { emoji: '🍒', value: 1, weight: 30 },  // Cherries (most common)
    { emoji: '🍋', value: 2, weight: 25 },  // Lemon
    { emoji: '🍊', value: 3, weight: 20 },  // Orange
    { emoji: '🍇', value: 4, weight: 15 },  // Grapes
    { emoji: '🍉', value: 5, weight: 10 },  // Watermelon
    { emoji: '🔔', value: 10, weight: 8 },  // Bell
    { emoji: '💎', value: 15, weight: 5 },  // Diamond
    { emoji: '7️⃣', value: 20, weight: 3 },  // Seven
    { emoji: '🌟', value: 0, weight: 4 }    // Scatter (pays separately)
];

// Pre-calculate weighted symbols for random selection
const weightedSymbols = [];
SLOT_SYMBOLS.forEach((symbol, index) => {
    for (let i = 0; i < symbol.weight; i++) {
        weightedSymbols.push(index);
    }
});

// Define all 40 paylines (simplified patterns)
const paylinePatterns = [
    // Horizontal lines (4)
    [[0,0], [1,0], [2,0], [3,0], [4,0]], // Line 1 (top)
    [[0,1], [1,1], [2,1], [3,1], [4,1]], // Line 2
    [[0,2], [1,2], [2,2], [3,2], [4,2]], // Line 3
    [[0,3], [1,3], [2,3], [3,3], [4,3]], // Line 4 (bottom)
    
    // Diagonal lines (12)
    [[0,0], [1,1], [2,2], [3,1], [4,0]], // V shape
    [[0,3], [1,2], [2,1], [3,2], [4,3]], // ^ shape
    [[0,1], [1,0], [2,0], [3,0], [4,1]], // Top V
    [[0,2], [1,3], [2,3], [3,3], [4,2]], // Bottom ^
    [[0,0], [1,1], [2,1], [3,1], [4,0]], // Small V
    [[0,3], [1,2], [2,2], [3,2], [4,3]], // Small ^
    [[0,1], [1,2], [2,2], [3,2], [4,1]], // Middle V
    [[0,2], [1,1], [2,1], [3,1], [4,2]], // Middle ^
    [[0,0], [1,0], [2,1], [3,2], [4,2]], // L shape
    [[0,2], [1,2], [2,1], [3,0], [4,0]], // Reverse L
    [[0,3], [1,3], [2,2], [3,1], [4,1]], // Bottom L
    [[0,1], [1,1], [2,2], [3,3], [4,3]], // Bottom reverse L
    
    // Additional patterns to make 40 (simplified for example)
    ...Array(24).fill().map((_, i) => 
        [[0,i%4], [1,(i+1)%4], [2,(i+2)%4], [3,(i+1)%4], [4,i%4]]
    )
].slice(0, PAYLINES);

client.on('ready', () => {
    console.log(`🔥 40 Dazzling Hot Slot Bot ready as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    if (message.content.toLowerCase() === '!spin') {
        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('bet_amount')
                    .setPlaceholder('Select your bet amount')
                    .addOptions([
                        { label: '10 coins', value: '10' },
                        { label: '25 coins', value: '25' },
                        { label: '50 coins', value: '50' },
                        { label: '100 coins', value: '100' },
                        { label: 'MAX BET (200)', value: '200' }
                    ])
            );

        await message.reply({
            content: '🎰 **40 Dazzling Hot Slot Machine** 🎰\nChoose your bet amount:',
            components: [row]
        });
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isStringSelectMenu()) return;
    
    if (interaction.customId === 'bet_amount') {
        const betAmount = parseInt(interaction.values[0]);
        await interaction.deferUpdate();
        
        // Initial empty grid
        const emptyGrid = Array(REELS).fill().map(() => Array(REEL_ROWS).fill('⬜'));
        let spinMsg = await interaction.editReply({
            content: spinningMessage(interaction.user, betAmount, emptyGrid, 0),
            components: []
        });

        // Generate final result first
        const finalGrid = generateFinalGrid();
        
        // Animate each reel stopping one by one
        for (let reel = 0; reel < REELS; reel++) {
            // For each reel, show spinning animation for a few steps
            for (let step = 0; step < 5; step++) {
                const animationGrid = animateReelSpin(emptyGrid, finalGrid, reel, step);
                spinMsg = await spinMsg.edit(spinningMessage(interaction.user, betAmount, animationGrid, reel));
                await new Promise(resolve => setTimeout(resolve, SPIN_DELAY));
            }
            
            // Show final position for this reel
            const stoppedGrid = stopReel(emptyGrid, finalGrid, reel);
            spinMsg = await spinMsg.edit(spinningMessage(interaction.user, betAmount, stoppedGrid, reel + 1));
            await new Promise(resolve => setTimeout(resolve, SPIN_DELAY));
        }

        // Final result
        const result = calculateWins(finalGrid, betAmount);
        await spinMsg.edit(resultMessage(interaction.user, betAmount, finalGrid, result));
    }
});

function generateFinalGrid() {
    const grid = [];
    for (let reel = 0; reel < REELS; reel++) {
        const reelSymbols = [];
        for (let row = 0; row < REEL_ROWS; row++) {
            const randomIndex = weightedSymbols[Math.floor(Math.random() * weightedSymbols.length)];
            reelSymbols.push(SLOT_SYMBOLS[randomIndex].emoji);
        }
        grid.push(reelSymbols);
    }
    return grid;
}

function animateReelSpin(currentGrid, finalGrid, currentReel, step) {
    const grid = JSON.parse(JSON.stringify(currentGrid));
    
    // For the current spinning reel, show symbols falling down
    if (currentReel < REELS) {
        for (let row = 0; row < REEL_ROWS; row++) {
            // Show random symbols with a falling effect
            const randomIndex = weightedSymbols[Math.floor(Math.random() * weightedSymbols.length)];
            grid[currentReel][row] = SLOT_SYMBOLS[randomIndex].emoji;
            
            // For reels that have already stopped, show their final symbols
            for (let r = 0; r < currentReel; r++) {
                grid[r] = [...finalGrid[r]];
            }
        }
    }
    
    return grid;
}

function stopReel(currentGrid, finalGrid, reel) {
    const grid = JSON.parse(JSON.stringify(currentGrid));
    grid[reel] = [...finalGrid[reel]];
    return grid;
}

function calculateWins(grid, betAmount) {
    let totalWin = 0;
    const winningLines = [];
    const scatterPositions = [];
    
    // Find scatter positions (stars)
    for (let reel = 0; reel < REELS; reel++) {
        for (let row = 0; row < REEL_ROWS; row++) {
            if (grid[reel][row] === '🌟') {
                scatterPositions.push([reel, row]);
            }
        }
    }
    
    // Scatter pays 3x bet for 3+, 5x for 4+, 10x for 5
    if (scatterPositions.length >= 3) {
        const scatterMultiplier = scatterPositions.length === 3 ? 3 : 
                               scatterPositions.length === 4 ? 5 : 10;
        totalWin += betAmount * scatterMultiplier;
    }
    
    // Check each payline
    paylinePatterns.forEach((pattern, lineIndex) => {
        const lineSymbols = pattern.map(([reel, row]) => grid[reel][row]);
        const firstSymbol = lineSymbols[0];
        
        // Count consecutive matching symbols from left
        let count = 1;
        for (let i = 1; i < lineSymbols.length; i++) {
            if (lineSymbols[i] === firstSymbol) count++;
            else break;
        }
        
        // Need at least 3 matching symbols to win
        if (count >= 3) {
            const symbolValue = SLOT_SYMBOLS.find(s => s.emoji === firstSymbol)?.value || 0;
            const win = symbolValue * betAmount * (count === 3 ? 1 : count === 4 ? 2 : 3);
            totalWin += win;
            winningLines.push({
                line: lineIndex + 1,
                symbol: firstSymbol,
                count: count,
                win: win
            });
        }
    });
    
    return {
        totalWin,
        winningLines,
        scatterCount: scatterPositions.length
    };
}

function spinningMessage(user, bet, grid, stoppedReels) {
    let display = '';
    for (let row = 0; row < REEL_ROWS; row++) {
        display += '| ';
        for (let reel = 0; reel < REELS; reel++) {
            display += grid[reel][row] + ' | ';
        }
        display += '\n';
    }
    
    let status = '';
    if (stoppedReels === 0) {
        status = 'Starting spin...';
    } else if (stoppedReels < REELS) {
        status = `Reels stopping... (${stoppedReels}/${REELS})`;
    } else {
        status = 'All reels stopped!';
    }
    
    return `🎰 **40 Dazzling Hot** 🎰\n` +
           `Player: ${user.username} | Bet: ${bet} coins\n\n` +
           `${display}\n` +
           `${status}`;
}

function resultMessage(user, bet, grid, result) {
    let display = '';
    for (let row = 0; row < REEL_ROWS; row++) {
        display += '| ';
        for (let reel = 0; reel < REELS; reel++) {
            display += grid[reel][row] + ' | ';
        }
        display += '\n';
    }
    
    let winMessage = '';
    if (result.totalWin > 0) {
        winMessage = `🎉 **YOU WON ${result.totalWin} COINS!** 🎉\n`;
        
        if (result.scatterCount >= 3) {
            winMessage += `✨ ${result.scatterCount} Scatter Symbols (${result.scatterCount === 3 ? '3x' : result.scatterCount === 4 ? '5x' : '10x'} bet)! ✨\n`;
        }
        
        if (result.winningLines.length > 0) {
            winMessage += `📈 Winning Lines:\n${result.winningLines.map(l => `• Line ${l.line}: ${l.symbol} x${l.count} = ${l.win} coins`).join('\n')}\n`;
        }
    } else {
        winMessage = '😢 No winning combinations this time. Try again!\n';
    }
    
    return `🎰 **40 Dazzling Hot** 🎰\n` +
           `Player: ${user.username} | Bet: ${bet} coins\n\n` +
           `${display}\n` +
           `${winMessage}\n` +
           `_Type !spin to play again_`;
}

client.login(BOT_TOKEN);
