import {resources} from "./resources.js";

var interval = null;

createResourcesTable();
createButton("auto_run", autoRun, "Automatically take turns.");
createButton("next_turn", nextTurn, "Take no action this turn.");
createButton("build_basic_homes", craft, "Build basic homes.", {
	"input": {
		"wood": 20,
		"stone": 20
	},
	"output": {
		"basic_homes": 1
	}
});
createButton("build_farms", craft, "Create farmland.", {
	"input": { "wood": 10, "metals": 1, "adults": 5 },
	"output": { "farming": 1, "workers": 5 }
});
createButton("build_logging_camps", craft, "Create logging camps.", {
	"input": { "wood": 5, "stone": 2, "metals": 1, "adults": 5 },
	"output": { "logging": 1, "workers": 5 }
});
createButton("build_quarries", craft, "Build quarries to quarry stone.", {
	"input": { "wood": 15, "adults": 5 },
	"output": { "quarries": 1, "workers": 5 }
});
createButton("build_mines", craft, "Build mines to mine metals and fuel.", {
	"input": { "wood": 50, "stone": 10, "adults": 5 },
	"output": { "mines": 1, "workers": 5 }
});
createButton("improve_food_distribution", craft, "Build food distribution and storage infrastructure.", {
	"input": { "wood": 10, "stone": 10, "adults": 1 },
	"output": { "food_distribution": 1, "workers": 1 }
});
createButton("expand_government", craft, "Expand government.", {
	"input": { "wood": 10, "stone": 20, "adults": 2 },
	"output": { "food_distribution": 1, "workers": 1 }
});

/**
 *
 */
function nextTurn() {

	// Cache resource lists.
	var pop = resources["population"];
	var inf = resources["infrastructure"];
	var raw = resources["raw_materials"];

	// Population change.
	pop["adults"] /= 1.0005 * (1 + (raw["food"] === 0) * 2);	// Adults die (more from hunger)
	pop["children"] /= 1.05 * (1 + (raw["food"] === 0) * 2);	// Children die (more from hunger)

	if (pop["adults"] < inf["basic_homes"] * 5 - pop["workers"]) {
		pop["adults"] += pop["children"] * 0.1 * raw["food"] * 0.01;		// Children grow into adults.
		pop["children"] -= pop["children"] * 0.1 * raw["food"] * 0.01;
		pop["children"] += pop["adults"] * raw["food"] * 0.0005; 	// Adults give birth to children.
	}

	// Homelessness
	else {
		pop["adults"] /= 1.005 * (1 + (raw["food"] === 0) * 2);
	}

	// Food consumption.
	raw["food"] -= pop["adults"] * 0.5 + pop["children"] * 0.25;

	// Production from infrastructure.
	raw["food"] += inf["farming"] * 10 * (1 + inf["food_distribution"]);
	raw["wood"] += inf["logging"] * 10;
	raw["stone"] += inf["quarries"] * 10;
	raw["metals"] += inf["mines"] * 5;
	raw["fuel"] += inf["mines"] * 5;
	raw["gems"] += inf["mines"];

	// Rotting/wasted/general use of materials.
	raw["food"] *= 0.8;
	raw["wood"] *= 0.9;
	raw["fuel"] *= 0.95;
	raw["metals"] *= 0.95;
	raw["stone"] *= 0.95;
	raw["gems"] *= 0.99;

	// Homes using fuel.
	raw["fuel"] -= inf["basic_homes"] * 0.1;

	updateResourcesTable();
	updateDescription()

}

/**
 *
 */
function autoRun() {
	if (!interval) {
		interval = setInterval(nextTurn, 100);
	} else {
		clearInterval(interval);
		interval = null;
	}
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
 *
 */
function updateDescription() {

	//
	var desc = "";

	// Cache resource lists.
	var pop = resources["population"];
	var inf = resources["infrastructure"];
	var raw = resources["raw_materials"];

	//
	if (inf["government"] <= 0) {
		desc += "No one is in charge of anything. ";
	}

	//
	if (pop["adults"] >= inf["basic_homes"] * 5 - 5 - pop["workers"]) {
		desc += "The population needs more housing in order to grow. ";
	}

	if (raw["food"] <= 100) {
		desc += "There is little food to go around. ";
	}

	if (raw["food"] <= 0) {
		desc += "<font color='red'>People are starving to death! </font>";
	}

	//
	document.getElementById("description").innerHTML = desc;

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
	if (callback === craft) {
		tooltip += "<br> Cost: " + JSON.stringify(craftList.input);
		tooltip += "<br> Result: " + JSON.stringify(craftList.output);
	}
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
	tooltip.innerHTML = text;
}

/**
 *
 */
function clearTooltip() {
	setTooltip("");
}
