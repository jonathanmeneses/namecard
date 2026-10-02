class QwirkleGame {
    constructor() {
        this.players = [];
        this.scores = {};
        this.roundHistory = [];
        this.currentRound = 1;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateDisplay();
    }

    bindEvents() {
        document.getElementById('playerNameInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addPlayer();
            }
        });
    }

    addPlayer() {
        const input = document.getElementById('playerNameInput');
        const name = input.value.trim();

        if (!name) {
            alert('Please enter a player name');
            return;
        }

        if (this.players.includes(name)) {
            alert('Player already exists');
            return;
        }

        if (this.players.length >= 8) {
            alert('Maximum 8 players allowed');
            return;
        }

        this.players.push(name);
        this.scores[name] = 0;
        input.value = '';
        input.focus();
        this.updateDisplay();
    }

    removePlayer(name) {
        this.players = this.players.filter(p => p !== name);
        delete this.scores[name];
        this.roundHistory = this.roundHistory.map(round => {
            const newRound = { ...round };
            delete newRound[name];
            return newRound;
        });
        this.updateDisplay();
    }

    updateDisplay() {
        this.updatePlayersList();
        this.updateScoreInputs();
        this.updateLeaderboard();
        this.updateHistory();
        this.updateStats();
        this.toggleSections();
    }

    toggleSections() {
        const hasPlayers = this.players.length > 0;
        const hasHistory = this.roundHistory.length > 0;

        document.getElementById('leaderboardCard').style.display = hasPlayers ? 'block' : 'none';
        document.getElementById('scoringCard').style.display = hasPlayers ? 'block' : 'none';
        document.getElementById('historyCard').style.display = hasHistory ? 'block' : 'none';
        document.getElementById('statsCard').style.display = hasHistory ? 'block' : 'none';
    }

    updatePlayersList() {
        const container = document.getElementById('playersList');
        container.innerHTML = this.players.map(name => `
            <div class="player-tag">
                <span>${name}</span>
                <button class="remove-btn" onclick="game.removePlayer('${name}')">×</button>
            </div>
        `).join('');
    }

    updateScoreInputs() {
        const container = document.getElementById('scoreInputs');
        container.innerHTML = this.players.map(name => `
            <div class="score-input-group">
                <label>${name}</label>
                <input type="number" 
                       class="score-input" 
                       id="score-${name}" 
                       min="0" 
                       max="36" 
                       value="0"
                       onkeypress="if(event.key==='Enter') game.submitScores()">
                <div class="qwirkle-checkbox">
                    <input type="checkbox" id="qwirkle-${name}">
                    <label for="qwirkle-${name}">QWIRKLE! (+6)</label>
                </div>
            </div>
        `).join('');
    }

    updateLeaderboard() {
        const container = document.getElementById('leaderboardContent');
        if (this.players.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999;">No players added yet</p>';
            return;
        }

        const sortedPlayers = [...this.players].sort((a, b) => this.scores[b] - this.scores[a]);

        container.innerHTML = sortedPlayers.map((name, index) => {
            let medalClass = '';
            let medal = '';
            if (index === 0 && this.scores[name] > 0) {
                medalClass = 'gold';
                medal = '🥇';
            } else if (index === 1 && this.scores[name] > 0) {
                medalClass = 'silver';
                medal = '🥈';
            } else if (index === 2 && this.scores[name] > 0) {
                medalClass = 'bronze';
                medal = '🥉';
            }

            return `
                <div class="leader-item ${medalClass}">
                    <div class="leader-rank">${medal || (index + 1)}</div>
                    <div class="leader-name">${name}</div>
                    <div class="leader-score">${this.scores[name]}</div>
                </div>
            `;
        }).join('');
    }

    updateHistory() {
        if (this.roundHistory.length === 0) return;

        const header = document.getElementById('historyHeader');
        const body = document.getElementById('historyBody');

        header.innerHTML = `
            <tr>
                <th>Round</th>
                ${this.players.map(name => `<th>${name}</th>`).join('')}
            </tr>
        `;

        body.innerHTML = this.roundHistory.map((round, index) => `
            <tr>
                <td><strong>Round ${index + 1}</strong></td>
                ${this.players.map(name => `<td>${round[name] || 0}</td>`).join('')}
            </tr>
        `).join('');

        body.innerHTML += `
            <tr class="total-row">
                <td>TOTAL</td>
                ${this.players.map(name => `<td>${this.scores[name]}</td>`).join('')}
            </tr>
        `;
    }

    updateStats() {
        const container = document.getElementById('statsGrid');

        if (this.roundHistory.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999;">No rounds played yet</p>';
            return;
        }

        const stats = this.calculateStats();

        container.innerHTML = `
            <div class="stat-card">
                <h4>📈 Rounds Played</h4>
                <div class="stat-value">${this.roundHistory.length}</div>
            </div>
            <div class="stat-card">
                <h4>🎯 Highest Round</h4>
                <div class="stat-value">${stats.highestRound}</div>
                <div class="stat-label">${stats.highestRoundPlayer}</div>
            </div>
            <div class="stat-card">
                <h4>⭐ Best Average</h4>
                <div class="stat-value">${stats.bestAverage}</div>
                <div class="stat-label">${stats.bestAveragePlayer || 'N/A'}</div>
            </div>
            <div class="stat-card">
                <h4>🏆 Current Leader</h4>
                <div class="stat-value">${this.scores[stats.leader] || 0}</div>
                <div class="stat-label">${stats.leader || 'N/A'}</div>
            </div>
        `;
    }

    calculateStats() {
        const highestRound = Math.max(...this.roundHistory.map(round =>
            Math.max(...Object.values(round))
        ));

        const highestRoundPlayer = (() => {
            for (let round of this.roundHistory) {
                for (let [player, score] of Object.entries(round)) {
                    if (score === highestRound) return player;
                }
            }
            return 'N/A';
        })();

        const averageScores = {};
        this.players.forEach(name => {
            const playerScores = this.roundHistory.map(round => round[name] || 0);
            averageScores[name] = playerScores.length > 0 ?
                (playerScores.reduce((a, b) => a + b, 0) / playerScores.length).toFixed(1) : 0;
        });

        const bestAverage = Math.max(...Object.values(averageScores));
        const bestAveragePlayer = Object.keys(averageScores).find(name =>
            parseFloat(averageScores[name]) === bestAverage
        );

        const sortedByScore = [...this.players].sort((a, b) => this.scores[b] - this.scores[a]);
        const leader = sortedByScore[0];

        return {
            highestRound,
            highestRoundPlayer,
            bestAverage,
            bestAveragePlayer,
            leader
        };
    }

    submitScores() {
        if (this.players.length === 0) {
            alert('Please add players first');
            return;
        }

        const roundScores = {};
        let hasScore = false;

        for (let name of this.players) {
            const scoreInput = document.getElementById(`score-${name}`);
            const qwirkleCheckbox = document.getElementById(`qwirkle-${name}`);
            let score = parseInt(scoreInput.value) || 0;

            if (score < 0 || score > 36) {
                alert(`Invalid score for ${name}. Score must be between 0 and 36.`);
                scoreInput.focus();
                return;
            }

            if (qwirkleCheckbox.checked) {
                score += 6;
            }

            if (score > 0) hasScore = true;
            roundScores[name] = score;
        }

        if (!hasScore) {
            alert('Please enter at least one score');
            return;
        }

        this.players.forEach(name => {
            this.scores[name] += roundScores[name];

            const scoreInput = document.getElementById(`score-${name}`);
            const qwirkleCheckbox = document.getElementById(`qwirkle-${name}`);
            scoreInput.value = 0;
            qwirkleCheckbox.checked = false;
        });

        this.roundHistory.push(roundScores);
        this.currentRound++;
        this.updateDisplay();

        const firstInput = document.querySelector('.score-input');
        if (firstInput) firstInput.focus();
    }

    undoLastRound() {
        if (this.roundHistory.length === 0) return;

        const lastRound = this.roundHistory.pop();
        this.players.forEach(name => {
            this.scores[name] -= (lastRound[name] || 0);
        });
        this.currentRound--;
        this.updateDisplay();
    }

    newGame() {
        if (confirm('Are you sure you want to start a new game? All scores will be reset.')) {
            this.players.forEach(name => {
                this.scores[name] = 0;
            });
            this.roundHistory = [];
            this.currentRound = 1;
            this.updateDisplay();
        }
    }

    saveGame() {
        const gameData = {
            players: this.players,
            scores: this.scores,
            roundHistory: this.roundHistory,
            currentRound: this.currentRound,
            timestamp: new Date().toISOString()
        };

        const dataStr = JSON.stringify(gameData);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `qwirkle-game-${new Date().toLocaleDateString()}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    loadGame() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload = event => {
                try {
                    const gameData = JSON.parse(event.target.result);

                    if (gameData.players && gameData.scores && gameData.roundHistory) {
                        this.players = gameData.players;
                        this.scores = gameData.scores;
                        this.roundHistory = gameData.roundHistory;
                        this.currentRound = gameData.currentRound || this.roundHistory.length + 1;

                        this.updateDisplay();
                        alert('Game loaded successfully!');
                    } else {
                        alert('Invalid game file');
                    }
                } catch (error) {
                    alert('Error loading game file');
                }
            };

            reader.readAsText(file);
        };

        input.click();
    }

    exportResults() {
        if (this.players.length === 0) {
            alert('No game data to export');
            return;
        }

        let exportText = '🎯 QWIRKLE GAME RESULTS\n';
        exportText += '='.repeat(30) + '\n\n';
        exportText += `Date: ${new Date().toLocaleDateString()}\n`;
        exportText += `Rounds Played: ${this.roundHistory.length}\n\n`;

        exportText += '🏆 FINAL STANDINGS\n';
        exportText += '-'.repeat(30) + '\n';
        const sortedPlayers = [...this.players].sort((a, b) => this.scores[b] - this.scores[a]);
        sortedPlayers.forEach((name, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            exportText += `${medal} ${name}: ${this.scores[name]} points\n`;
        });

        if (this.roundHistory.length > 0) {
            exportText += '\n📝 ROUND BY ROUND\n';
            exportText += '-'.repeat(30) + '\n';
            this.roundHistory.forEach((round, index) => {
                exportText += `Round ${index + 1}: `;
                exportText += this.players.map(name => `${name}: ${round[name] || 0}`).join(', ');
                exportText += '\n';
            });
        }

        navigator.clipboard.writeText(exportText).then(() => {
            alert('Results copied to clipboard! You can now paste them anywhere.');
        }).catch(() => {
            const dataUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(exportText);
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', `qwirkle-results-${new Date().toLocaleDateString()}.txt`);
            linkElement.click();
        });
    }
}

const game = new QwirkleGame();

function addPlayer() { game.addPlayer(); }
function submitScores() { game.submitScores(); }
function undoLastRound() { game.undoLastRound(); }
function newGame() { game.newGame(); }
function saveGame() { game.saveGame(); }
function loadGame() { game.loadGame(); }
function exportResults() { game.exportResults(); }