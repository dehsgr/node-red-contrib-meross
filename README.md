# node-red-contrib-meross 
This provides nodes for locally controlling e.g. Meross Smart Plug (without cloud!). It's requiring your Merross key to be provided by you. You should get this data via network sniffer or traffic interception between your Meross app and your Smart Plug or via user info fetch tool (see below). node-red-contrib-meross delivers 2 nodes:

## Meross Config
Meross Config is a config node to set the token, message id and timestamp for being able to locally communicate with your devices.

## Meross Smart Plug
Meross Smart Plug can be used to set smart plugs state and/or poll its current state. For setting smart plugs state to on|off you simply provide a boolean value (true|false). To request its current state you send any non-boolean payload.
If your smart plug has multiple channels, all channels are triggered by default. You might control specific channels by passing the desired channel index via msg.channel attribute (1...n, 0=all channels). You might override node's ip address (e.g. '192.168.0.10') via its msg.ip attribute.

You might query Electricity Information from your Smart Plug (if supported) with the following payload:
<pre>
{
  "namespace": "Appliance.Control.Electricity"
}
</pre>

## Meross Garage Door
Meross Garage Door can be used to set garage doors state and/or poll its current state. For setting garage doors state to open|closed you simply provide a boolean value (true|false). To request its current state you send any non-boolean payload.

# Currently supported devices
<table>
  <tr>
    <td><b>Meross Garage Door</b></td>
    <td>
      - MSG100<br />
      - MSG200<br />
    </td>
  </tr>
  <tr>
    <td><b>Meross Smart Plug</b></td>
    <td>
      - MSS110<br/>
      - MSS210<br/>
      - MSS310<br/>
      - MSS425<br />
    </td>
  </tr>
  <tr>
    <td><b>Meross Smart Switch</b></td>
    <td>- MSS710 (via Smart plug node)</td>
  </tr>
</table>

# Getting your Meross key
To be able to use these nodes you must provide your Meross key to your node config.

## How to sniff the key
1. You might download Fiddler.
2. Configure it to capture HTTPS traffic.
3. Transfer Fiddlers HTTPS certificate to your phone and trust it there.
4. Configure your phone to use Fiddler as proxy according to your configuration.
5. Capture traffic while logging in with Meross app into your account.

Now you should see a request in Fiddler like "https://[canvary].meross.com/v1/Auth/signin" with type "POST".

6. Select that request and switch over to response body tab.
7. Change format for the response body to "JSON".

This should look like:
<pre>
{
	"apiStatus": 0,
	"sysStatus": 0,
	"data": {
		"token": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
		"key":   "abcdef01234567890abcdef01234567890",
		"userid": "123456",
		"email": "yourmail@domain.tld",
		"domain": "https://[canvary].meross.com",
		"mqttDomain": "mqtt-[canvary].meross.com"
	},
	"info": "Success",
	"timeStamp": 1632308678
}
</pre>

The key is the value from „key“.

## Howto fetch the key via fetch tool (requires Node.js >= v14)
- Take a look at https://github.com/jixunmoe/meross-login :-)

# Requesting additional devices
To be able to implement additional devices feel free to provide sniffed communication between your app and devices.
You might also feel free to directly contribute in this project.

## How to sniff required data for additional devices
1. You might download Fiddler.
2. Configure it to capture HTTPS traffic.
3. Transfer Fiddlers HTTPS certificate to your phone and trust it there.
4. Configure your phone to use Fiddler as proxy according to your configuration.
5. Capture traffic while changing your smart plug state with Meross app.

Now you should see a request in Fiddle like "http://yourip/config" with type "POST".

6. Select that request and switch over to "request" body tab.
7. Change format for the request body to "JSON".

This should look like:
<pre>
{
	"payload": {},
	"header": {
		"messageId": "1234567890abcdef1234567890abcdef",
		"method": "GET",
		"from": "http://yourip/config",
		"sign": "567890abcdef1234567890abcdef12345678",
		"namespace": "Appliance.System.Ability",
		"triggerSrc": "iOSLocal",
		"timestamp": 1609232320,
		"payloadVersion": 1
	}
}
</pre>

The token is the value from „sign“. The corresponding timestamp is the value from „timestamp“. The message id is the value from „messageid“.

# Sample Flow
<code>[{"id":"88f87bae.10d938","type":"inject","z":"ec2c2ba0.1671a8","name":"Get State","props":[{"p":"payload"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":180,"y":160,"wires":[["f7696f8c.ae16c"]]},{"id":"f7696f8c.ae16c","type":"smartplug-control","z":"ec2c2ba0.1671a8","confignode":"d9dc372f.d15f08","name":"Smart Plug","ip":"10.10.10.10","x":370,"y":120,"wires":[["759b6fbe.d2d68"]]},{"id":"5b5e94ca.a0c614","type":"inject","z":"ec2c2ba0.1671a8","name":"Turn On","props":[{"p":"payload"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"true","payloadType":"bool","x":180,"y":80,"wires":[["f7696f8c.ae16c"]]},{"id":"60c5c941.c24568","type":"inject","z":"ec2c2ba0.1671a8","name":"Turn Off","props":[{"p":"payload"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"false","payloadType":"bool","x":180,"y":120,"wires":[["f7696f8c.ae16c"]]},{"id":"759b6fbe.d2d68","type":"debug","z":"ec2c2ba0.1671a8","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"false","statusVal":"","statusType":"auto","x":570,"y":120,"wires":[]},{"id":"d9dc372f.d15f08","type":"meross-config","name":"Meross Config","key":"abcdef01234567890abcdef01234567890"}]</code>
