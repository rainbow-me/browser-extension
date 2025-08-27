We need to add more test coverage for adding RPCs and custom networks. we have a test dapp we are currently using in e2e/serial/dappInteractions/1_appInteractionsFlow.test.ts which covers other flows and interacts with this dapp. can we add tests which meet the following goals and use the correct elements laid out below? The tests should:
- start in the extension like the other tests
- go to the dapp
- interact with the elements
- go back to the extension and have assertions that show the correct behavior from interacting with the dapp elements

Feel free to research through our app, come up with a strategy and then implement it as best as you can. run the test locally to assure correct implementation. feel free to ask me questions as we go. no other part of the extension should need to be changed apart from this specific test file and potentially our helpers file in e2e/helpers.ts


Here is the linear ticket:

Goal:

add e2e test to add custom network

add e2e test to add custom rpc for mainnet

Test dapp: https://bx-test-dapp.vercel.app/

relevent elements: 

element: <button class="Home_button__G93Ef" id="addRPC">add rpc</button>
element: <button class="Home_button__G93Ef" id="addNetwork">add network</button>