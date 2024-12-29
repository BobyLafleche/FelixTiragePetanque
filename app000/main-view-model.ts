import { Observable, ObservableArray } from '@nativescript/core';

export interface Match {
    matchNumber: number;
    matchText: string;
}

export class HelloWorldModel extends Observable {
    private _playerCount: string = "";
    private _matches: ObservableArray<Match>;

    constructor() {
        super();
        this._matches = new ObservableArray<Match>();
    }

    get playerCount(): string {
        return this._playerCount;
    }

    set playerCount(value: string) {
        if (this._playerCount !== value) {
            this._playerCount = value;
            this.notifyPropertyChange('playerCount', value);
        }
    }

    get matches(): ObservableArray<Match> {
        return this._matches;
    }

    onReset() {
        this.playerCount = "";
        this._matches.splice(0);
        this.notifyPropertyChange('matches', this._matches);
    }

    onDraw() {
        try {
            const count = parseInt(this.playerCount);
            
            if (isNaN(count) || count < 4 || count > 99) {
                this._matches.splice(0);
                this._matches.push({
                    matchNumber: 1,
                    matchText: "Le nombre de joueurs doit être entre 4 et 99"
                });
                return;
            }

            const players = Array.from({length: count}, (_, i) => i + 1);
            this.shuffleArray(players);
            
            this._matches.splice(0);
            let matchNumber = 1;
            const modulo = count % 4;

            switch (modulo) {
                case 0: // Que des doublettes
                    for (let i = 0; i < modulo; i++) {
                        const team1 = players.splice(0, 2);
                        const team2 = players.splice(0, 2);
                        this._matches.push({
                            matchNumber: matchNumber++,
                            matchText: `${team1.join(", ")} contre ${team2.join(", ")}`
                        });
                    }
                    break;

                case 1: // Dernière ligne en 2v3
                    for (let i = 0; i < modulo - 1; i++) {
                        const team1 = players.splice(0, 2);
                        const team2 = players.splice(0, 2);
                        this._matches.push({
                            matchNumber: matchNumber++,
                            matchText: `${team1.join(", ")} contre ${team2.join(", ")}`
                        });
                    }
                    const lastTeam1 = players.splice(0, 2);
                    const lastTeam2 = players.splice(0, 3);
                    this._matches.push({
                        matchNumber: matchNumber++,
                        matchText: `${lastTeam1.join(", ")} contre ${lastTeam2.join(", ")}`
                    });
                    break;

                case 2: // Dernière ligne en 3v3
                    for (let i = 0; i < modulo - 1; i++) {
                        const team1 = players.splice(0, 2);
                        const team2 = players.splice(0, 2);
                        this._matches.push({
                            matchNumber: matchNumber++,
                            matchText: `${team1.join(", ")} contre ${team2.join(", ")}`
                        });
                    }
                    const tripleTeam1 = players.splice(0, 3);
                    const tripleTeam2 = players.splice(0, 3);
                    this._matches.push({
                        matchNumber: matchNumber++,
                        matchText: `${tripleTeam1.join(", ")} contre ${tripleTeam2.join(", ")}`
                    });
                    break;

                case 3: // Avant-dernière en 3v3, dernière en 2v3
                    for (let i = 0; i < modulo - 2; i++) {
                        const team1 = players.splice(0, 2);
                        const team2 = players.splice(0, 2);
                        this._matches.push({
                            matchNumber: matchNumber++,
                            matchText: `${team1.join(", ")} contre ${team2.join(", ")}`
                        });
                    }
                    const preLastTeam1 = players.splice(0, 3);
                    const preLastTeam2 = players.splice(0, 3);
                    this._matches.push({
                        matchNumber: matchNumber++,
                        matchText: `${preLastTeam1.join(", ")} contre ${preLastTeam2.join(", ")}`
                    });
                    const finalTeam1 = players.splice(0, 2);
                    const finalTeam2 = players.splice(0, 3);
                    this._matches.push({
                        matchNumber: matchNumber++,
                        matchText: `${finalTeam1.join(", ")} contre ${finalTeam2.join(", ")}`
                    });
                    break;
            }
            
            this.notifyPropertyChange('matches', this._matches);
        } catch (error) {
            console.error('Erreur lors du tirage:', error);
            this._matches.splice(0);
            this._matches.push({
                matchNumber: 1,
                matchText: "Une erreur est survenue lors du tirage"
            });
            this.notifyPropertyChange('matches', this._matches);
        }
    }

    private shuffleArray(array: number[]): void {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}