import React, {Component} from 'react'

import io from 'socket.io-client'

import TweenMax from 'gsap'

import rand_arr_elem from '../../helpers/rand_arr_elem'
import rand_to_fro from '../../helpers/rand_to_fro'

export default class SetName extends Component {

	constructor (props) {
		super(props)

		//BW
		this.columnCount = 7
		this.rowCount = 6
		this.connectCount = 4
		this.gameEnded = true
		this.currentPlayer = { 'playernumber': 1 }
		this.livePlayer = null
		
		this.insertData = null
		this.gameData = null

		this.randomSettings()
		this.initialiseGame()

		//BW

		this.win_sets = [
			['c1', 'c2', 'c3'],
			['c4', 'c5', 'c6'],
			['c7', 'c8', 'c9'],

			['c1', 'c4', 'c7'],
			['c2', 'c5', 'c8'],
			['c3', 'c6', 'c9'],

			['c1', 'c5', 'c9'],
			['c3', 'c5', 'c7']
		]

		if (this.props.game_type != 'live'){
			this.state = {
				cell_vals: {},
				next_turn_ply: true,
				game_play: true,
				game_stat: 'Start game'
			}
			//BW
			this.initialiseGame()
		}
		else {

			this.sock_start()

			this.state = {
				cell_vals: {},
				next_turn_ply: true,
				game_play: false,
				game_stat: 'Connecting'
			}
		}
	}


	//BW
	initialiseGame () {
		this.gameEnded = false
		this.insertData = this.buildInsertData(this.columnCount)
		this.gameData = this.buildGameData(this.columnCount, this.rowCount)
	}

	randomSettings () {
		this.rowCount = 4 + Math.floor(Math.random() * 4)
		this.columnCount = 5 + Math.floor(Math.random() * 5)
		this.connectCount = 3 + Math.floor((Math.random() * (Math.min(this.rowCount, this.columnCount) - 3)))
	}

	buildInsertData(columnCount) {
		console.log("build insert data")
		let newInsertData = new Array()
        for (let i = 0; i < columnCount; i++) {
            newInsertData.push(i)
        }
        return newInsertData
	}

	buildGameData(columnCount, rowCount) {
        //let the game data be a 2d grid holding the state of the game
		//0 = unoccupied, 1 = player 1 occupied, 2 = player 2 occupied
		console.log("build game data")
        let newGameData = new Array()
        for (let i = 0; i < rowCount; i++) {
            let newGameDataRow = new Array()
            for (let j = 0; j < columnCount; j++) {
                newGameDataRow.push(0)
            }
            newGameData.push(newGameDataRow)
        }
        return newGameData
    }
//	------------------------	------------------------	------------------------

	componentDidMount () {
    	TweenMax.from('#game_stat', 1, {display: 'none', opacity: 0, scaleX:0, scaleY:0, ease: Power4.easeIn})
    	TweenMax.from('#game_board', 1, {display: 'none', opacity: 0, x:-200, y:-200, scaleX:0, scaleY:0, ease: Power4.easeIn})
	}

//	------------------------	------------------------	------------------------
//	------------------------	------------------------	------------------------

	sock_start () {

		this.socket = io(app.settings.ws_conf.loc.SOCKET__io.u);

		this.socket.on('connect', function(data) { 
			// console.log('socket connected', data)

			this.socket.emit('new player', { name: app.settings.curr_user.name });

		}.bind(this));

		this.socket.on('pair_players', function(data) { 
			// console.log('paired with ', data)

			this.livePlayer = data.mode

			//update the BW grid
			//conditions:{rows:rowSize, columns: colSize, connect: connectSize}
			this.columnCount = data.conditions.columns
			this.rowCount = data.conditions.rows
			this.connectCount = data.conditions.connect
			this.initialiseGame()

			this.setState({
				next_turn_ply: data.mode=='m',
				game_play: true,
				game_stat: 'Playing with ' + data.opp.name
			})

		}.bind(this));

		this.socket.on('opp_turn', this.turn_opp_live_x.bind(this));

	}

//	------------------------	------------------------	------------------------
//	------------------------	------------------------	------------------------

	componentWillUnmount () {

		this.socket && this.socket.disconnect();
	}

//	------------------------	------------------------	------------------------

	cell_cont (c) {
		const { cell_vals } = this.state

		return (<div>
		        	{cell_vals && cell_vals[c]=='x' && <i className="fa fa-times fa-5x"></i>}
					{cell_vals && cell_vals[c]=='o' && <i className="fa fa-circle-o fa-5x"></i>}
				</div>)
	}

//	------------------------	------------------------	------------------------

	render () {
		const { cell_vals } = this.state
		// console.log(cell_vals)

		return (
			<div>
			<div id='GameMain'>
				
				<h1>Play {this.props.game_type}</h1>
				<h2>Connect {this.connectCount}</h2>
				<h3>{this.columnCount} x {this.rowCount}</h3>

				<div id="game_stat">
					<div id="game_stat_msg">{this.state.game_stat}</div>
					{this.state.game_play && <div id="game_turn_msg">{this.state.next_turn_ply ? 'Your turn' : 'Opponent turn'}</div>}
				</div>

					<div id="gameConnectX">
						<div id="insertArea" className="insert_area">
							{this.gameData[0].map((element, index) => <div id={"insert_cell_" + index} ref={"insert_cell_" + index} className="insert_cell" key={"insert_cell_" + index} onClick={() => this.insertCellClick(index)}></div>)}
						</div>
						<div id="gameArea" className="game_area">
							{this.gameData.map((element, index) => <div ref={"gameAreaRow_" + index} id={"gameAreaRow_" + index} className="game_row" key={"gameAreaRow_" + index}>
								{this.gameData[index].map((element, indexj) => <div ref={"gameCell_" + index + "_" + indexj} id={"gameCell_" + index + "_" + indexj} className="game_cell" key={"gameCell_" + index + "_" + indexj}></div>)}
							</div>)}
						</div>
					</div>

				<div style={{display: 'none'}}>
				<div id="game_board">
					<table>
					<tbody>
						<tr>
							<td id='game_board-c1' ref='c1' onClick={this.click_cell.bind(this)}> {this.cell_cont('c1')} </td>
							<td id='game_board-c2' ref='c2' onClick={this.click_cell.bind(this)} className="vbrd"> {this.cell_cont('c2')} </td>
							<td id='game_board-c3' ref='c3' onClick={this.click_cell.bind(this)}> {this.cell_cont('c3')} </td>
						</tr>
						<tr>
							<td id='game_board-c4' ref='c4' onClick={this.click_cell.bind(this)} className="hbrd"> {this.cell_cont('c4')} </td>
							<td id='game_board-c5' ref='c5' onClick={this.click_cell.bind(this)} className="vbrd hbrd"> {this.cell_cont('c5')} </td>
							<td id='game_board-c6' ref='c6' onClick={this.click_cell.bind(this)} className="hbrd"> {this.cell_cont('c6')} </td>
						</tr>
						<tr>
							<td id='game_board-c7' ref='c7' onClick={this.click_cell.bind(this)}> {this.cell_cont('c7')} </td>
							<td id='game_board-c8' ref='c8' onClick={this.click_cell.bind(this)} className="vbrd"> {this.cell_cont('c8')} </td>
							<td id='game_board-c9' ref='c9' onClick={this.click_cell.bind(this)}> {this.cell_cont('c9')} </td>
						</tr>
					</tbody>
					</table>
				</div>
				</div>

				<button type='submit' onClick={this.end_game.bind(this)} className='button'><span>End Game <span className='fa fa-caret-right'></span></span></button>

			</div>

			
			</div>
			
		)
	}

	insertCellClick(index) {
		//console.log(this.props)
		//console.log(this.refs)
		
		if (!this.state.next_turn_ply || !this.state.game_play) return

		const nextAvailibleRow = this.nextAvailibleRow(index)
		if (nextAvailibleRow < 0) return

		if (this.props.game_type != 'live')
			//this.turn_ply_comp(cell_id)
			this.turn_ply_comp_x(index)
		else
			//this.turn_ply_live(cell_id)
			this.turn_ply_live_x(index)

		//in future this should be pushed to the server them insertCell called on return

		//now allow the computer to go
		//this.computerTurn()

		/*

				if (!this.state.next_turn_ply || !this.state.game_play) return

		const cell_id = e.currentTarget.id.substr(11)
		if (this.state.cell_vals[cell_id]) return

		if (this.props.game_type != 'live')
			this.turn_ply_comp(cell_id)
		else
			this.turn_ply_live(cell_id)

		*/
		
	}

	insertCell (index, player) {

		if (this.gameEnded) return 0

		//this is probably be pushed to the server too
		const nextAvailibleRow = this.nextAvailibleRow(index)

		//console.log("Move: " + index + ", player: " + player + ", legal: " + legalMove)
		if (nextAvailibleRow >= 0){
			this.gameData[nextAvailibleRow][index] = player['playernumber']
			const reference = "gameCell_" + nextAvailibleRow + "_" + index

			if(player['playernumber'] === 1){
				this.refs[reference].classList.add("player_one_occupied")
				player['playernumber'] = 2
			} else {
				this.refs[reference].classList.add("player_two_occupied")
				player['playernumber'] = 1
			}

			this.checkEndgame()
			this.checkDrawGame()
			
			return 1
		}

		return 0

	}

	computerTurn() {
		
		if (this.gameEnded) return
		if (this.currentPlayer['playernumber'] === 1) return
		//just do a random. the end game should be called if there is nothing left
		let turnComplete = false
		let attempts = 0
		while(turnComplete === false && attempts < 1000){
			const index = Math.floor(Math.random() * this.columnCount) + 1
			turnComplete = (this.insertCell(index, this.currentPlayer) != 0)
			attempts+=1
		}
		

	}

	checkEndgame() {
		let winner = this.checkHorizontalWin()
		
        if (winner == 0) {
            winner = this.checkVerticalWin()
            if (winner == 0) {
                winner = this.checkDiagonalUp()
                if (winner == 0) winner = this.checkDiagonalDown()
            }
		}
		
        if (winner != 0) { this.endGame(winner) }
        return winner
	}
	
	checkDrawGame() {
		//call this after checkendgame since the last possible move could win first
        for (let i = 0; i < this.gameData.length; i++) {
            for (let j = 0; j < this.gameData[i].length; j++) {
                if (this.gameData[i][j] === 0) return 0
            }
        }
        //we only get here if the grid is completely filled!
		this.endGame(0)
		return 1
	}

	checkHorizontalWin() {
        //Note: not optimised at all!
        //returns the player who won or 0
        for (let i = 0; i < this.gameData.length; i++) {
            for (let j = 0; j < this.gameData[i].length - (this.connectCount - 1); j++) {
                //console.log("a!")
                if (this.gameData[i][j] !== 0) {
                    let currentlyCheckedPlayer = this.gameData[i][j]
                    let currentlyCheckedConnected = 1
                    for (let k = j + 1; k < this.gameData[i].length; k++) {
                        if (this.gameData[i][k] !== currentlyCheckedPlayer) break
                        currentlyCheckedConnected += 1
                    }
                    if (currentlyCheckedConnected >= this.connectCount) {
                        //update the display!
                        for (let k = j; currentlyCheckedConnected > 0; k++) {
							//update 
							const reference = "gameCell_" + i + "_" + k
                            this.refs[reference].classList.add("game_end")
                            currentlyCheckedConnected -= 1
                        }
                        return currentlyCheckedPlayer
                    }
                }
            }
        }
        return 0
	}
	
	checkVerticalWin() {
        //Note: not optimised at all!
        //returns the player who won or 0
        for (let i = 0; i < this.gameData.length - (this.connectCount - 1); i++) {
            for (let j = 0; j < this.gameData[i].length; j++) {
                //console.log("a!")
                if (this.gameData[i][j] !== 0) {
                    let currentlyCheckedPlayer = this.gameData[i][j]
                    let currentlyCheckedConnected = 1
                    for (let k = i + 1; k < this.gameData.length; k++) {
                        if (this.gameData[k][j] !== currentlyCheckedPlayer) break
                        currentlyCheckedConnected += 1
                    }
                    if (currentlyCheckedConnected >= this.connectCount) {
                        //update the display!
                        for (let k = i; currentlyCheckedConnected > 0; k++) {
							//update 
							const reference = "gameCell_" + k + "_" + j
                            this.refs[reference].classList.add("game_end")
                            currentlyCheckedConnected -= 1
                        }
                        return currentlyCheckedPlayer
                    }
                }
            }
        }
        return 0
	}
	
	checkDiagonalUp() {
		//Note: not optimised at all!
		//returns the player who won or 0
		let i, j, k, l
        for (i = 0; i < this.gameData.length - (this.connectCount - 1); i++) {
            for (j = this.connectCount - 1; j < this.gameData[i].length; j++) {
                //console.log("a!")
                if (this.gameData[i][j] !== 0) {
                    let currentlyCheckedPlayer = this.gameData[i][j]
                    let currentlyCheckedConnected = 1
                    for (k = i + 1, l = j - 1; k < this.gameData.length && l >= 0; k++, l--) {
                        if (this.gameData[k][l] !== currentlyCheckedPlayer) break
                        currentlyCheckedConnected += 1
                    }
                    if (currentlyCheckedConnected >= this.connectCount) {
                        //update the display!
                        for (k = i, l = j; currentlyCheckedConnected > 0; k++, l--) {
							//update 
							const reference = "gameCell_" + k + "_" + l
                            this.refs[reference].classList.add("game_end")
                            currentlyCheckedConnected -= 1
                        }
                        return currentlyCheckedPlayer
                    }
                }
            }
        }
        return 0
	}

	checkDiagonalDown(){
		//Note: not optimised at all!
		//returns the player who won or 0
		let i, j, k, l
        for (i = 0; i < this.gameData.length - (this.connectCount - 1); i++) {
            for (j = 0; j < this.gameData[i].length - (this.connectCount - 1); j++) {
                //console.log("a!")
                if (this.gameData[i][j] !== 0) {
                    let currentlyCheckedPlayer = this.gameData[i][j]
                    let currentlyCheckedConnected = 1
                    for (k = i + 1, l = j + 1; k < this.gameData.length && l < this.gameData[k].length; k++, l++) {
                        if (this.gameData[k][l] !== currentlyCheckedPlayer) break
                        currentlyCheckedConnected += 1
                    }
                    if (currentlyCheckedConnected >= this.connectCount) {
                        //update the display!
                        for (k = i, l = j; currentlyCheckedConnected > 0; k++, l++) {
							//update 
							const reference = "gameCell_" + k + "_" + l
                            this.refs[reference].classList.add("game_end")
                            currentlyCheckedConnected -= 1
                        }
                        return currentlyCheckedPlayer
                    }
                }
            }
        }
        return 0
	}

	endGame(playerID) {
        this.gameEnded = true
        if (playerID === 0) {
			//document.getElementById("message").innerHTML = "Draw game! Click setup to re-start"
        } else {
            //document.getElementById("message").innerHTML = "Game won by player " + playerID + "!"
        }
    }

	clearLayout() {
		//hmmm, just need to rerender really
		this.initialiseGame()
    }

	nextAvailibleRow (index) {
        for (let i = this.gameData.length - 1; i >= 0; i--) {
            if (this.gameData[i][index] === 0) {
                return i
            }
		}
		return -1
	}

//	------------------------	------------------------	------------------------
//	------------------------	------------------------	------------------------

	click_cell (e) {
		// console.log(e.currentTarget.id.substr(11))
		// console.log(e.currentTarget)

		if (!this.state.next_turn_ply || !this.state.game_play) return

		const cell_id = e.currentTarget.id.substr(11)
		if (this.state.cell_vals[cell_id]) return

		if (this.props.game_type != 'live')
			this.turn_ply_comp(cell_id)
		else
			this.turn_ply_live(cell_id)
	}

//	------------------------	------------------------	------------------------
//	------------------------	------------------------	------------------------

	turn_ply_comp_x (index) {

		/* asd123 */
		console.log("Player click " + index)

		this.insertCell(index, this.currentPlayer)//asdasdasd

		this.check_turn_x()

	}

	turn_ply_comp (cell_id) {

		let { cell_vals } = this.state

		cell_vals[cell_id] = 'x'

		TweenMax.from(this.refs[cell_id], 0.7, {opacity: 0, scaleX:0, scaleY:0, ease: Power4.easeOut})


		// this.setState({
		// 	cell_vals: cell_vals,
		// 	next_turn_ply: false
		// })

		// setTimeout(this.turn_comp.bind(this), rand_to_fro(500, 1000));

		this.state.cell_vals = cell_vals

		this.check_turn()
	}

//	------------------------	------------------------	------------------------

	turn_comp_x () {

		this.computerTurn()

		this.check_turn_x()

	}

	turn_comp () {

		let { cell_vals } = this.state
		let empty_cells_arr = []


		for (let i=1; i<=9; i++) 
			!cell_vals['c'+i] && empty_cells_arr.push('c'+i)
		// console.log(cell_vals, empty_cells_arr, rand_arr_elem(empty_cells_arr))

		const c = rand_arr_elem(empty_cells_arr)
		cell_vals[c] = 'o'

		TweenMax.from(this.refs[c], 0.7, {opacity: 0, scaleX:0, scaleY:0, ease: Power4.easeOut})


		// this.setState({
		// 	cell_vals: cell_vals,
		// 	next_turn_ply: true
		// })

		this.state.cell_vals = cell_vals

		this.check_turn()
	}


//	------------------------	------------------------	------------------------
//	------------------------	------------------------	------------------------

	turn_ply_live_x(index) {

		console.log("Player click " + index)

		this.insertCell(index, this.currentPlayer)//asdasdasd

		this.socket.emit('ply_turn', { cell_id: index });

		this.check_turn_x()

	}

	turn_ply_live (cell_id) {

		let { cell_vals } = this.state

		cell_vals[cell_id] = 'x'

		TweenMax.from(this.refs[cell_id], 0.7, {opacity: 0, scaleX:0, scaleY:0, ease: Power4.easeOut})

		this.socket.emit('ply_turn', { cell_id: cell_id });

		// this.setState({
		// 	cell_vals: cell_vals,
		// 	next_turn_ply: false
		// })

		// setTimeout(this.turn_comp.bind(this), rand_to_fro(500, 1000));

		this.state.cell_vals = cell_vals

		this.check_turn_x()
	}

//	------------------------	------------------------	------------------------

	turn_opp_live_x (data) {

		console.log("Opponent click " + data.cell_id)

		this.insertCell(data.cell_id, this.currentPlayer)//asdasdasd

		this.check_turn_x()

	}

	turn_opp_live (data) {

		let { cell_vals } = this.state
		let empty_cells_arr = []


		const c = data.cell_id
		cell_vals[c] = 'o'

		TweenMax.from(this.refs[c], 0.7, {opacity: 0, scaleX:0, scaleY:0, ease: Power4.easeOut})


		// this.setState({
		// 	cell_vals: cell_vals,
		// 	next_turn_ply: true
		// })

		this.state.cell_vals = cell_vals

		this.check_turn()
	}

//	------------------------	------------------------	------------------------
//	------------------------	------------------------	------------------------
//	------------------------	------------------------	------------------------

	check_turn_x () {


		let draw = (this.checkDrawGame() === 1)
		let winner = this.checkEndgame()
		
		if (winner > 0) {

			console.log(this.livePlayer)

			if ((winner === 1) && (this.livePlayer === "s")) winner = 0

			this.setState({
				game_stat: (winner===1?'You':'Opponent')+' win',
				game_play: false
			})

			this.socket && this.socket.disconnect();

		} else if (draw) {
		
			this.setState({
				game_stat: 'Draw',
				game_play: false
			})

			this.socket && this.socket.disconnect();

		} else {
			this.props.game_type!='live' && this.state.next_turn_ply && setTimeout(this.turn_comp_x.bind(this), rand_to_fro(500, 1000));

			this.setState({
				next_turn_ply: !this.state.next_turn_ply
			})
		}
	}

	check_turn () {

		const { cell_vals } = this.state

		let win = false
		let set
		let fin = true

		if (this.props.game_type!='live')
			this.state.game_stat = 'Play'


		for (let i=0; !win && i<this.win_sets.length; i++) {
			set = this.win_sets[i]
			if (cell_vals[set[0]] && cell_vals[set[0]]==cell_vals[set[1]] && cell_vals[set[0]]==cell_vals[set[2]])
				win = true
		}


		for (let i=1; i<=9; i++) 
			!cell_vals['c'+i] && (fin = false)

		// win && console.log('win set: ', set)

		if (win) {
		
			this.refs[set[0]].classList.add('win')
			this.refs[set[1]].classList.add('win')
			this.refs[set[2]].classList.add('win')

			TweenMax.killAll(true)
			TweenMax.from('td.win', 1, {opacity: 0, ease: Linear.easeIn})

			this.setState({
				game_stat: (cell_vals[set[0]]=='x'?'You':'Opponent')+' win',
				game_play: false
			})

			this.socket && this.socket.disconnect();

		} else if (fin) {
		
			this.setState({
				game_stat: 'Draw',
				game_play: false
			})

			this.socket && this.socket.disconnect();

		} else {
			this.props.game_type!='live' && this.state.next_turn_ply && setTimeout(this.turn_comp.bind(this), rand_to_fro(500, 1000));

			this.setState({
				next_turn_ply: !this.state.next_turn_ply
			})
		}
		
	}

//	------------------------	------------------------	------------------------

	end_game () {
		this.socket && this.socket.disconnect();

		this.props.onEndGame()
	}



}
