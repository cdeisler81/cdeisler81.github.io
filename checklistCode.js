// grab all the html sections needed
var inputBox1 = document.getElementById('Team_1_Input');
var inputBox2 = document.getElementById('Team_2_Input');
var arrayBox1 = document.getElementById('team1Arr');
var arrayBox2 = document.getElementById('team2Arr');
var adjustDisplay = document.getElementById('AdjResult');
var resultDisplay = document.getElementById('OfferResult');
var team1arr = [];
var team2arr = [];

// set up all the event listeners
inputBox1.addEventListener("blur", addTask, false);
inputBox2.addEventListener("blur", addTaskTwo, false);

// Function that adds the player to team 1's offer when the 1st event listener goes
function addTask() {
  const taskList = document.getElementById('Team_1_List');

  if(Object.keys(names).includes(inputBox1.value))
  {
    const li = document.createElement('li');
    li.innerHTML = inputBox1.value + ": " + names[inputBox1.value];


    taskList.appendChild(li);
    team1arr.push(names[inputBox1.value]);
  }

  inputBox1.value = "";
  adjustDisplay.innerHTML = "Adjustment is: " + Adjustment(team1arr, team2arr, false);
  updateAdjustment();
}

// same as the above function, but I don't know how to make the function agnostic of the input,
// so for now it's its own function for team 2
function addTaskTwo() {
  // grab the output list
  const taskList = document.getElementById('Team_2_List');

  // if input is in the list of players
  if(Object.keys(names).includes(inputBox2.value))
  {
    // create the list object to display to the screen and fill it with the info
    const li = document.createElement('li');
    li.innerHTML = inputBox2.value + ": " + names[inputBox2.value];

    taskList.appendChild(li);
    team2arr.push(names[inputBox2.value]);
  }
  inputBox2.value = "";
  updateAdjustment();
}

function updateAdjustment()
{
  var adjustment = Adjustment(team1arr, team2arr, false);
  // adjustment outlet logic
  if(adjustment > 0)
  {
    adjustDisplay.innerHTML = "Adjustment is: " + adjustment + " in favor of team 1";
  }
  else if(adjustment < 0)
  {
    adjustDisplay.innerHTML = "Adjustment is " + adjustment * -1 + " in favor of team 2";
  }
  else
  {
    adjustDisplay.innerHTML = "There is no adjustment";
  }
  // result output logic
  var offer1Total = arraySum(team1arr);
  var offer2Total = arraySum(team2arr);

  adjustment > 0 ? offer1Total += adjustment : offer2Total -= adjustment;

  if(offer1Total > offer2Total)
  {
    resultDisplay.innerHTML = "Team 1's offer is better: " + offer1Total + " vs " + offer2Total;
  }
  else if(offer2Total > offer1Total)
  {
    resultDisplay.innerHTML = "Team 2's offer is better: " + offer1Total + " vs " + offer2Total;
  }
  else
  {
    resultDisplay.innerHTML = "The trade is even: " + offer1Total + " vs " offer2Total;
  }
}

function Adjustment(offer1, offer2, retDifference = false) {
  var offer1Arr = [];
  var offer2Arr = [];

  // make sure the incoming offers aren't just single numbers which breaks it
  typeof offer1 == "number" ? offer1Arr.push(offer1) : offer1Arr = loadArray(offer1, offer1Arr);
  typeof offer2 == "number" ? offer2Arr.push(offer2) : offer2Arr = loadArray(offer2, offer2Arr);

  //this is for the end when I want to know what player is needed
  var offer1Total = arraySum(offer1Arr);
  var offer2Total = arraySum(offer2Arr);

  // make sure incoming arrays are sorted; spreadsheet calls are set up to be entered sorted, but other function calls might not be
  offer1Arr = offer1Arr.map(Number);
  offer2Arr = offer2Arr.map(Number);
  offer1Arr.sort((a, b) => {
    if (a < b) {
     return -1;
   }
    if (a > b) {
      return 1;
    }
      return 0;
    }
  );
  offer2Arr.sort((a, b) => {
    if (a < b) {
     return -1;
   }
    if (a > b) {
      return 1;
    }
      return 0;
    }
  );

  var currHighPlusAdj = 0;
  var retAdj = 0;
  var currentImbalance = 0;
  var imbalanceAdj = 0;
  var offer1Last = true;

  // loop through the 2 offers until offers are processed
  while(offer1Arr.length > 0 && offer2Arr.length > 0)
  {
    // at the start get the top two players
    currentImbalance = 0;
    var topOffer1Asset = offer1Arr.pop();
    var topOffer2Asset = offer2Arr.pop();

    // determine which one is better and use that player value as the basis for the imbalance adjustment
    if(Math.max(topOffer1Asset,topOffer2Asset) > 85)
    {
      imbalanceAdj = 10;
    }
    else if(Math.max(topOffer1Asset,topOffer2Asset) < 20)
    {
      imbalanceAdj = 5;
    }
    else
    {
      imbalanceAdj = Math.round((Math.max(topOffer1Asset,topOffer2Asset) + 40) / 12);
    }

    // determine which asset is better or if they're the same, and progress from there

    // if offer 1 asset is higher
    if(topOffer1Asset > topOffer2Asset && offer2Arr.length > 0)
    {
      currHighPlusAdj = Number(playerAdj(topOffer1Asset)) + Number(topOffer1Asset) + Number((currHighPlusAdj * -1)) - Number(topOffer2Asset) - Number(eliteBonus(topOffer2Asset));
      retAdj += playerAdj(topOffer1Asset) - eliteBonus(topOffer2Asset);
      while(currHighPlusAdj > 0 && offer2Arr.length > 0)
      {
        if(currentImbalance > 0)
        {
          currHighPlusAdj = currHighPlusAdj - (offer2Arr.pop() - imbalanceAdj);
          retAdj += imbalanceAdj;
        }
        else
        {
          currHighPlusAdj = currHighPlusAdj - offer2Arr.pop();
        }
        currentImbalance += 1;
      }
      if(currHighPlusAdj < 0)
      {
        retAdj += currHighPlusAdj / 2;
      }
    }
    // if offer 2 asset is higher
    else if(topOffer2Asset > topOffer1Asset && offer1Arr.length > 0)
    {
      currHighPlusAdj = Number(playerAdj(topOffer2Asset)) + Number(topOffer2Asset) + Number((currHighPlusAdj * -1)) - Number(topOffer1Asset) - Number(eliteBonus(topOffer1Asset));
      retAdj -= playerAdj(topOffer2Asset) - eliteBonus(topOffer1Asset);

      while(currHighPlusAdj > 0 && offer1Arr.length > 0)
      {
        if(currentImbalance < 0)
        {
          currHighPlusAdj = currHighPlusAdj - (offer1Arr.pop() - imbalanceAdj);
          retAdj -= imbalanceAdj;
        }
        else
        {
          currHighPlusAdj = currHighPlusAdj - offer1Arr.pop();
        }
        currentImbalance -= 1;
      }
      if(currHighPlusAdj < 0)
      {
        retAdj -= currHighPlusAdj / 2;
      }
    }
    // if they are the same, remove them and carry on
    else
    {
      // offer1Arr.pop();
      // offer2Arr.pop();
    }
  }

  var retVal = retAdj;

  if(retVal > 0)
  {
    offer1Total += retVal;
  }
  else{
    offer2Total -= retVal;
  }

  if(retDifference == true)
  {
    return offer1Total - offer2Total;
  }
  else
  {
    return retVal;
  }
}

// returns player's adjustment + elite bonus
function playerAdj(playerVal) {
  var retVal = 0;
  var eliteVal = 0;
  if(playerVal > 80)
  {
    eliteVal = eliteBonus(playerVal);
  }
  retVal = playerVal * .20 + eliteVal;
  return Math.round(retVal);
}
// return the bonus exclusively from being an elite player
function eliteBonus(playerVal)
{
  var eliteVal = 0;
  if(playerVal > 80)
  {
    eliteVal = ((playerVal - 80) * .01) * playerVal;
  }
  return Math.round(eliteVal);
}

function arrayAverage(arr)
{
  var sum = 0;
  for(var i = 0; i < arr.length; i++)
  {
    sum += Number(arr[i]);
  }
  return Math.round(sum/arr.length);
}

function testFunc(arr)
{
  return arr.sort().reverse();
}

function arraySum(arr)
{
  var sum = 0;
  for(var i = 0; i < arr.length; i++)
  {
    sum += Number(arr[i]);
  }
  return sum;
}

function loadArray(oldArr, newArr){
  for(var i = 0 ;  i < oldArr.length; i++)
  {
    newArr.push(oldArr[i]);
  }
  return newArr;
}

function testSort(arr)
{
  arr = arr.map(Number)
  return arr.sort((a, b) => {
    if (a < b) {
     return -1;
   }
    if (a > b) {
      return 1;
    }
      return 0;
    }
  );
}
function neededValue(possibleValues, offer1, offer2)
{
  var trimmedValues = [];
  var offer1Higher = true;
  var offer1Arr = [];
  var offer2Arr = [];

  typeof offer1 == "number" ? offer1Arr.push(offer1) : offer1Arr = loadArray(offer1, offer1Arr);
  typeof offer2 == "number" ? offer2Arr.push(offer2) : offer2Arr = loadArray(offer2, offer2Arr);

  for(var i = 0; i < possibleValues.length - 1; i++)
  {
    if(Number(possibleValues[i]) != Number(possibleValues[i+1]))
    {
      trimmedValues.push(possibleValues[i]);
    }
  }
  if(Adjustment(offer1Arr, offer2Arr, true) > 0)
  {
    offer1Higher = true;
  }
  else if(Adjustment(offer1Arr, offer2Arr, true) < 0)
  {
    offer1Higher = false;
  }
  else {return;}

  var start = 0;
  var end = trimmedValues.length - 1;
  var mid = Math.floor((start+end) / 2);
  var bestIndex = mid;

  // test possible values using a binary search to find optimal value for trade
  // determine which side needs to have the test assets added to it
  while(start + 1 < end)
  {
    var comp1Offer1 = [];
    var comp1Offer2 = [];
    var comp2Offer1 = [];
    var comp2Offer2 = [];

    if(offer1Higher == true)
    {
      comp1Offer2.push(trimmedValues[mid]);
      comp2Offer2.push(trimmedValues[mid+1]);
    }
    else
    {
      comp1Offer1.push(trimmedValues[mid]);
      comp2Offer1.push(trimmedValues[mid+1]);
    }
    loadArray(offer1Arr, comp1Offer1);
    loadArray(offer2Arr, comp1Offer2);
    loadArray(offer1Arr, comp2Offer1);
    loadArray(offer2Arr, comp2Offer2);
    var bottomCompScore = Math.abs(Adjustment(comp1Offer1, comp1Offer2, true));
    var topCompScore = Math.abs(Adjustment(comp2Offer1, comp2Offer2, true));
    if(bottomCompScore < topCompScore)
    {
      if(bottomCompScore < trimmedValues[bestIndex])
      {
        bestIndex = mid;
      }
      end = mid;
      mid = Math.floor((start + end) / 2);
    }
    else if(topCompScore < bottomCompScore)
    {
      if(topCompScore < trimmedValues[bestIndex])
      {
        bestIndex = mid + 1;
      }
      start = mid + 1;
      mid = Math.floor((start + end) / 2);
    }
    else
    {
      return trimmedValues[mid];
    }
  }


  return trimmedValues[bestIndex];
}

var names = {
    "Josh Allen":           98,
    "Patrick Mahomes":      97,
    "Jalen Hurts":          95,
    "Justin Jefferson":     94,
    "Justin Herbert":       92,
    "Ja'Marr Chase":        90,
    "Joe Burrow":           90,
    "Jonathan Taylor":      88,
    "Lamar Jackson":        88,
    "Christian McCaffrey":  85,
    "CeeDee Lamb":          85,
    "Breece Hall":          83,
    "A.J. Brown":           83,
    "Trevor Lawrence":      83,
    "Kenneth Walker III":   78,
    "Justin Fields":        78,
    "Saquon Barkley":       75,
    "Jaylen Waddle":        75,
    "Deshaun Watson":       75,
    "Austin Ekeler":        72,
    "Tee Higgins":          72,
    "Kyle Pitts":           72,
    "Amon-Ra St. Brown":    70,
    "2023 Early 1st":       70,
    "Stefon Diggs":         68,
    "Kyler Murray":         68,
    "Travis Etienne Jr.":   66,
    "Tyreek Hill":          66,
    "Mark Andrews":         66,
    "Dak Prescott":         66,
    "DK Metcalf":           63,
    "Garrett Wilson":       62,
    "Tua Tagovailoa":       62,
    "Javonte Williams":     60,
    "Davante Adams":        60,
    "Travis Kelce":         60,
    "D'Andre Swift":        58,
    "Josh Jacobs":          57,
    "Joe Mixon":            56,
    "Cooper Kupp":          56,
    "Nick Chubb":           54,
    "Drake London":         54,
    "Rhamondre Stevenson":  53,
    "Chris Olave":          53,
    "Chris Godwin":         52,
    "2023 Mid 1st":         52,
    "Trey Lance":           52,
    "Najee Harris":         50,
    "DeVonta Smith":        50,
    "Kirk Cousins":         50,
    "2024 Early 1st":       48,
    "Derrick Henry":        48,
    "Deebo Samuel":         48,
    "Dalvin Cook":          47,
    "Michael Pittman Jr.":  47,
    "Tony Pollard":         46,
    "DJ Moore":             46,
    "Daniel Jones":         46,
    "J.K. Dobbins":         44,
    "Treylon Burks":        44,
    "Marquise Brown":       43,
    "Alvin Kamara":         43,
    "Terry McLaurin":       43,
    "George Kittle":        43,
    "Derek Carr":           43,
    "Dameon Pierce":        40,
    "Christian Watson":     40,
    "2023 Late 1st":        40,
    "2024 Mid 1st":         40,
    "Aaron Jones":          39,
    "Jameson Williams":     39,
    "Jerry Jeudy":          38,
    "T.J. Hockenson":       38,
    "Russell Wilson":       38,
    "George Pickens":       37,
    "Miles Sanders":        36,
    "Diontae Johnson":      36,
    "Brandon Aiyuk":        35,
    "Aaron Rodgers":        35,
    "Rashod Bateman":       35,
    "Dallas Goedert":       35,
    "Geno Smith":           35,
    "2024 Late 1st":        35,
    "Kenny Pickett":        34,
    "AJ Dillon":            33,
    "Jared Goff":           33,
    "2023 Early 2nd":       33,
    "Mike Williams":        32,
    "Matthew Stafford":     32,
    "Mike Evans":           32,
    "Rachaad White":        31,
    "DeAndre Hopkins":      31,
    "David Montgomery":     31,
    "Amari Cooper":         31,
    "Pat Freiermuth":       31,
    "Cam Akers":            30,
    "Jahan Dotson":         30,
    "Mac Jones":            30,
    "2024 Early 2nd":       29,
    "Brian Robinson Jr.":   29,
    "Christian Kirk":       29,
    "James Conner":         28,
    "2023 Mid 2nd":         28,
    "James Cook":           28,
    "Leonard Fournette":    28,
    "Calvin Ridley":        28,
    "David Njoku":          28,
    "Ezekiel Elliott":      27,
    "Keenan Allen":         27,
    "Gabe Davis":           26,
    "JuJu Smith-Schuster":  26,
    "Antonio Gibson":       26,
    "Courtland Sutton":     26,
    "Ryan Tannehill":       26,
    "2024 Mid 2nd":         26,
    "Khalil Herbert":       25,
    "Elijah Moore":         25,
    "Greg Dulcich":         25,
    "Tom Brady":            25,
    "Darren Waller":        24,
    "Tyler Lockett":        23,
    "Dalton Schultz":       23,
    "Isiah Pacheco":        23,
    "Darnell Mooney":       23,
    "Jimmy Garoppolo":      23,
    "Devin Singletary":     22,
    "Jakobi Meyers":        22,
    "2023 Late 2nd":        22,
    "Tyler Allgeier":       22,
    "Kadarius Toney":       22,
    "Kareem Hunt":          22,
    "Wan'Dale Robinson":    22,
    "Zach Wilson":          22,
    "Elijah Mitchell":      21,
    "Rondale Moore":        21,
    "Cole Kmet":            21,
    "Michael Carter":       20,
    "Skyy Moore":           20,
    "Trey McBride":         20,
    "Jamaal Williams":      20,
    "Chase Claypool":       20,
    "Damien Harris":        19,
    "Brandin Cooks":        19,
    "Jameis Winston":       19,
    "Clyde Edwards-Helaire": 18,
    "Dawson Knox":          18,
    "Desmond Ridder":       18,
    "Alexander Mattison":   18,
    "Alec Pierce":          18,
    "Evan Engram":          18,
    "Carson Wentz":         18,
    "Cordarrelle Patterson":17,
    "Romeo Doubs":          17,
    "Noah Fant":            17,
    "Baker Mayfield":       17,
    "Kenneth Gainwell":     16,
    "Curtis Samuel":        16,
    "Michael Gallup":       16,
    "Michael Thomas":       16,
    "D'Onta Foreman":       15,
    "Tyler Boyd":           15,
    "Gerald Everett":       15,
    "Jeff Wilson Jr.":      15,
    "Donovan Peoples-Jones":15,
    "Joshua Palmer":        15,
    "2023 Early 3rd":       14,
    "Jordan Love":          14,
    "Nico Collins":         14,
    "Allen Lazard":         14,
    "Zamir White":          14,
    "Isaiah Likely":        14,
    "Jerick McKinnon":      13,
    "Hunter Renfrow":       13,
    "Tyler Higbee":         13,
    "Rashaad Penny":        13,
    "Malik Willis":         13,
    "Jaylen Warren":        12,
    "Gus Edwards":          12,
    "Adam Theilen":         12,
    "Jelani Woods":         12,
    "Daniel Bellinger":    12,
    "Raheem Mostert":       12,
    "Zach Ertz":            12,
    "2024 Early 3rd":       11,
    "Chuba Hubbard":        11,
    "DJ Chark Jr.":         11,
    "Chigoziem Okonkwo":    11,
    "David Bell":           11,
    "2023 Mid 3rd":         10,
    "Isaiah Spiller":       10,
    "Allen Robinson II":    10,
    "Mike Gesicki":         10,
    "Nyheim Hines":         10,
    "Kyren Williams":       10,
    "Tyquan Thornton":      10,
    "Zonovan Knight":       9,
    "Pierre Strong Jr.":    9,
    "Khalil Shakir":        9,
    "Marcus Mariota":       9,
    "2024 Mid 3rd":         8,
    "Chase Edmonds":        8,
    "James Robinson":       8,
    "Corey Davis":          8,
    "Parris Campbell":      8,
    "Sam Darnold":          8,
    "2023 Late 3rd":        7,
    "Russell Gage":         7,
    "Terrace Marshall Jr.": 7,
    "John Metchie III":     7,
    "Cade Otton":           7,
    "Zay Jones":            7,
"Marquez Valdes-Scantling": 7,
    "Tyrion Davis-Price":   6,
    "K.J. Osborn":          6,
    "Odell Beckham Jr.":    6,
    "Darrell Henderson Jr.":6,
    "Robert Woods":         6,
    "KJ Hamler":            6,
    "Hunter Henry":         6,
    "2024 Late 3rd":        5,
    "Isaiah McKenzie":      5,
    "Davis Mills":          5,
    "Hassan Haskins":       5,
    "Mecole Hardman":       5,
    "Irv Smith Jr.":        5,
    "Melvin Gordon III":    4,
    "Van Jefferson":        4,
    "J.D. McKissic":        4,
    "Jalen Tolbert":        4,
    "Hayden Hurst":         4,
    "D'Ernest Johnson":     3,
    "DeVante Parker":       3,
    "Deon Jackson":         3,
    "Jarvis Landry":        3,
    "Brock Purdy":          3,
    "Kenyan Drake":         2,
    "Laviska Shenault Jr.": 2,
    "Keaontay Ingram":      2,
    "Darius Slayton":       2,
    "Matt Ryan":            2,
    "Zach Moss":            2,
    "Velus Jones Jr.":      2,
    "Logan Thomas":         2,
    "Jerome Ford":          1
};
