# node-red-contrib-meross 

This provides nodes for locally controlling e.g. Meross Smart Plug (without cloud!). It's requiring a Merross token and a corresponding message id and timestamp to be provided by you. You should get this data via network sniffer or traffic interception between your Meross app and your Smart Plug. node-red-contrib-meross delivers 2 nodes:

## Meross Config
Meross Config is a config node to set the token, message id and timestamp for being able to locally communicate with your devices.

## Meross Smart Plug
Meross Smart Plug can be used to set smart plugs state and/or poll its current state. For setting smart plugs state to on|off you simply provide a boolean value (true|false). To request its current state you send any non-boolean payload.

## Meross Garage Door
Meross Garage Door can be used to set garage doors state and/or poll its current state. For setting garage doors state to open|closed you simply provide a boolean value (true|false). To request its current state you send any non-boolean payload.

# Currently supported devices
- Meross Smart Plug MSS110(EU)
- Meross Smart Plug MSS210(EU)
- Meross Garage Door MSG100

# Requesting additional devices
To be able to implement additional devices feel free to provide sniffed communication between your app and devices.
You might also feel free to directly contribute in this project.
