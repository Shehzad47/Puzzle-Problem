$(function() {

	$('#btn-calculate').click(function(event) {
		$('#seq-input').val("");
		var moves = solve_puzzle();
		if (moves === false) $('#moves').text("This Puzzle Takes More Than 1000 Moves To Solve")
		else $('#moves').text("Puzzle Solved In " + moves + " Moves")
		$('#result').css('display', 'block');
	});

	$('#btn-close').click(function(event) {
		$('#result').css('display', 'none');
	});

	$('#seq-input').keypress(function(e) {
		var value = $(this).val();
		var entered_num = e.key;

		if ( !$.isNumeric( entered_num ) || entered_num == 9 || value.length >= 9 || value.indexOf(entered_num) >= 0){
			e.preventDefault();
		}

	})
	.keyup(function(event) {
		if ($(this).val().length >= 9) $('#btn-go').removeClass('w3-disabled');
		else $('#btn-go').addClass('w3-disabled');
		if ($(this).val().length < 9) $('#btn-calculate').addClass('w3-disabled');
	});

	$('#btn-go').click(function(event) {
		var sequence = $('#seq-input').val();
		set_puzzle(sequence);
		$('#btn-calculate').removeClass('w3-disabled');

	});

}); //End Of Document Ready Function

function solve_puzzle(){

	var empty_tile =  find_empty_tile();
	var no_of_placed_tiles = calculate_placed_tiles();
	var used_states = [];
	var no_of_moves = 0;
	var old_move = -1;

	var best_move = "";
	var current_state = find_current_state();
	var previous_state = find_current_state();

	while (no_of_placed_tiles != 9) {

		var prev_placed_tiles = 0;
		var counter = 0 ;

		var placed_tiles_per_check = [];
		var dup_moves = [];

		empty_tile =  find_empty_tile();
		var possible_moves = find_possible_moves(empty_tile);
		var length = possible_moves.length;
		while (possible_moves.length) {

			if (possible_moves[0] == old_move){
				possible_moves.shift();
				continue;
			}

			do_possible_moves(possible_moves, empty_tile);

			if (search_state( find_current_state(), used_states)) {
				possible_moves.shift();
				// set_puzzle(previous_state);
				counter ++;
				if (counter == length) {
					best_move = find_current_state();
					set_puzzle(best_move);
					used_states = [];
					break;

				}
				set_puzzle(previous_state);
				continue;
			}
			var move = possible_moves.shift();
			var current_placed_tiles = calculate_placed_tiles();

			if (current_placed_tiles >= prev_placed_tiles) {
				placed_tiles_per_check.push(current_placed_tiles);
				dup_moves.push(move);
				var top = placed_tiles_per_check[(placed_tiles_per_check.length) - 1];
				if (placed_tiles_per_check.length > 1) top = placed_tiles_per_check[(placed_tiles_per_check.length) - 2];

				if (current_placed_tiles != top) {
					placed_tiles_per_check = [];
				}
			}

			if (current_placed_tiles >= prev_placed_tiles) {
				prev_placed_tiles = current_placed_tiles ;
				best_move = find_current_state();
			}

			set_puzzle(previous_state);
			empty_tile =  find_empty_tile();
		}

		old_move = find_empty_tile();
		if (placed_tiles_per_check.length > 1) {
			var states = [];
			var present_state = find_current_state();
			for (var i = 0; i < dup_moves.length; i++) {
				var move = [dup_moves[i]];
				var empty = find_empty_tile();
				do_possible_moves(move,empty);
				states.push(find_current_state())
				set_puzzle(present_state);
			}

			var prev_ans = -1;

			for (var i = 0; i < states.length; i++) {
				if (prev_ans > -1) break;
				set_puzzle(states[i]);
				var current_ans = find_best();

				if (current_ans === false)
					continue;

				if (current_ans >= prev_ans) {
					best_move = states[i];
					prev_ans = current_ans;
					continue;
				}
			}
			if (prev_ans > 0) {
				no_of_moves += prev_ans;
				break;
			}
			// else used_states = [];
		}

		used_states.push(best_move);
		set_puzzle(best_move);

		previous_state = best_move;
		no_of_placed_tiles = calculate_placed_tiles();
		no_of_moves ++ ;

		if (no_of_moves == 100){
			return false;
			alert("Fail...")
			break;
		}
	}
	return no_of_moves;
}

function set_puzzle(seq){
	var puzzle_pieces = [1,2,3,4,5,6,7,8,0];

	puzzle_pieces.forEach( function(element, index) {
		var btn_txt = seq[index];
		var btn = "#btn_"+element;
		$(btn).text(btn_txt);
	});
}

function find_empty_tile(){
	var tiles = [1,2,3,4,5,6,7,8,0];
	var empty_tile  = 0 ;
	tiles.forEach( function(tile, i) {
		if ($('#btn_'+tile).text() == "0") empty_tile = tile;
	});
	return empty_tile;
}

function find_possible_moves(empty_tile){
	var possible_moves = [];
	if (empty_tile == "1") possible_moves = [2,4];
	if (empty_tile == "2") possible_moves = [1,5,3];
	if (empty_tile == "3") possible_moves = [2,6];
	if (empty_tile == "4") possible_moves = [1,5,7];
	if (empty_tile == "5") possible_moves = [2,4,6,8];
	if (empty_tile == "6") possible_moves = [3,5,0];
	if (empty_tile == "7") possible_moves = [4,8];
	if (empty_tile == "8") possible_moves = [7,5,0];
	if (empty_tile == "0") possible_moves = [6,8];

	return possible_moves;
}

function do_possible_moves(possible_moves, empty_tile){

	for (var i = 0; i < possible_moves.length; i++) {
		var move = possible_moves[i];
		var text_of_moved_tile = $('#btn_'+move).text();

		$('#btn_'+move).text("0");
		$('#btn_'+empty_tile).text(text_of_moved_tile);
		break;
	}
}

function calculate_placed_tiles(){
	var current_state = find_current_state();
	var goal_state = [1,2,3,4,5,6,7,8,0];
	var placed_tiles = 0;
	for (var i = 0; i < current_state.length; i++) {
		if (current_state[i] == goal_state[i]) placed_tiles ++
	}
return placed_tiles;
}

function find_current_state(){
	var tiles = [1,2,3,4,5,6,7,8,0];
	var current_state = "";
	tiles.forEach( function(tile, i) {
		current_state += $('#btn_'+tile).text()
	});
	return current_state;
}

function choose_best_move(multi_states){

	return multi_states[Math.floor(Math.random() * multi_states.length)];
}

function do_best_move(best_move){
	var old_move = find_empty_tile();
	set_puzzle(best_move);
	return old_move;
}

function search_state(state, used_states){
	var found = false;
	for (var i = 0; i < used_states.length; i++) {
		if( state == used_states[i]) found = true;
	}
	return found;
}

function find_best(){

	var empty_tile =  find_empty_tile();
	var no_of_placed_tiles = calculate_placed_tiles();
	var used_states = [];
	var old_move = -1;
	var no_of_moves = 0;

	var best_move = "";
	var current_state = find_current_state();
	var previous_state = find_current_state();

	while (no_of_placed_tiles != 9) {

		var prev_placed_tiles = 0;
		var counter = 0 ;

		empty_tile =  find_empty_tile();
		var possible_moves = find_possible_moves(empty_tile);
		var length = possible_moves.length;
		while (possible_moves.length) {

			if (possible_moves[0] == old_move){
				possible_moves.shift();
				continue;
			}

			do_possible_moves(possible_moves, empty_tile);

			if (search_state( find_current_state(), used_states)) {
				possible_moves.shift();
				set_puzzle(previous_state);
				counter ++;
				if (counter == length) {
					return false;
				}
				continue;
			}
			var move = possible_moves.shift();
			var current_placed_tiles = calculate_placed_tiles();

			if (current_placed_tiles >= prev_placed_tiles) {
				prev_placed_tiles = current_placed_tiles ;
				best_move = find_current_state();
			}

			set_puzzle(previous_state);
			empty_tile =  find_empty_tile();
		}
		old_move = find_empty_tile();
		used_states.push(best_move);
		set_puzzle(best_move);

		previous_state = best_move;
		no_of_placed_tiles = calculate_placed_tiles();
		no_of_moves ++ ;
	}
	return no_of_moves;
}

