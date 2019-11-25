import {resources} from "./resources.js";

createResourcesTable();
createButton("next_turn", nextTurn, "Take no action this turn.");
createButton("build_farms", craft, "Create farmland.", {
	"input": {
		"wood": 10,
		"metals": 1,
		"adults": 1
	},
	"output": {
		"farming": 1,
		"workers": 1
	}
});
createButton("build_logging_camps", craft, "Create logging camps.", {
	"input": {
		"wood": 5,
		"stone": 2,
		"metals": 1,
		"adults": 1
	},
	"output": {
		"logging": 1,
		"workers": 1
	}
});
createButton("build_quarries", craft, "Build quarries to quarry stone.", {
	"input": {
		"wood": 10,
		"metals": 5,
		"adults": 1
	},
	"output": {
		"quarries": 1,
		"workers": 1
	}
});
createButton("build_mines", craft, "Build mines to mine metals and fuel.", {
	"input": {
		"wood": 50,
		"metals": 10,
		"adults": 1
	},
	"output": {
		"mines": 1,
		"workers": 1
	}
});

/**
 *
 */
function nextTurn() {

	// Cache resource lists.
	var pop = resources["population"];
	var inf = resources["infrastructure"];
	var raw = resources["raw_materials"];

	// Population growth.
	pop["adults"] += pop["children"] * 0.1;		// Children grow into adults.
	pop["children"] -= pop["children"] * 0.1;
	pop["children"] += pop["adults"] * 0.05; 	// Adults give birth to children.

	// Food consumption.
	raw["food"] -= pop["adults"] + pop["children"] * 0.5;

	// Production from infrastructure.
	raw["food"] += inf["farming"] * 10;
	raw["wood"] += inf["logging"] * 10;
	raw["stone"] += inf["quarries"] * 10;
	raw["metals"] += inf["mines"] * 5;
	raw["fuel"] += inf["mines"] * 5;

	updateResourcesTable();
}

/**
 *
 */
function craft(craftList) {

	// CHeck we have the resources.
	var hasResources = true;
	for (var res in craftList["input"]) {
		if (craftList["input"][res] > getResource(res)) {
			hasResources = false;
		}
	}

	//
	if (hasResources) {

		// Take resources out.
		for (var res in craftList["input"]) {
			addResource(res, -craftList["input"][res]);
		}

		// Put resources in.
		for (var res in craftList["output"]) {
			addResource(res, craftList["output"][res]);
		}

	}

	//
	nextTurn();

}

/**
 *
 */
function getResource(name) {
	for (var tier in resources) {
		for (var res in resources[tier]) {
			if (res === name) {
				return resources[tier][res];
			}
		}
	}
	return 0;
}

/**
 *
 */
function addResource(name, amount) {
	for (var tier in resources) {
		for (var res in resources[tier]) {
			if (res === name) {
				resources[tier][res] += amount;
			}
		}
	}
}

/**
 * @return {void}
 */
function createResourcesTable() {
	var parentDiv = document.getElementById("div_resources");
	parentDiv.classList.add("row");
	for (var tier in resources) {
		var tierDiv = document.createElement("div");
		tierDiv.classList.add("column");
		tierDiv.innerHTML += "<div class='cell'><h2>" + tier + "</h2></div>";
		console.log(tier);
		for (var res in resources[tier]) {
			console.log(res);
			tierDiv.innerHTML += "<div class='cell'><h4 class='label'>" + res + "</h4><h4 id='"+res+"' class='value'>" + resources[tier][res] + "</h4></div>";
		}
		parentDiv.appendChild(tierDiv);
	}
}

/**
 *
 */
function updateResourcesTable() {
	for (var tier in resources) {
		for (var res in resources[tier]) {
			var resourceValue = document.getElementById(res);
			resourceValue.textContent = ~~resources[tier][res];
		}
	}
}

/**
 * @param {!string} name
 * @param {!Function} callback
 * @param {!string} tooltip
 * @param {?Object} craftList
 * @return {void}
 */
function createButton(name, callback, tooltip, craftList) {
	var parentDiv = document.getElementById("div_buttons");
	var button = document.createElement("input");
	button.type = "button";
	button.value = name;
	button.onmouseover = setTooltip.bind(null, tooltip);
	button.onclick = (callback === craft) ? callback.bind(null, craftList) : callback;
	parentDiv.appendChild(button);
}

/**
 *
 */
function setTooltip(text) {
	var tooltip = document.getElementById("tooltip");
	tooltip.textContent = text;
}

/**
 *
 */
function clearTooltip() {
	setTooltip("");
}
