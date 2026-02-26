# check24
okay we are doing a hackathon in two hours. please build the basic structure for that.
here is the idea: its an ios app that fills out german tax documents for the user
It works via speech only. here are some examples of tax forms that the app would fill out. 
https://www.formulare-bfinv.de/ffw/resources/ticket/7jXKurlVRqmM85ZF15FRtA/Anlage_Vorsorgeaufwand_2025.pdf 
https://www.formulare-bfinv.de/ffw/resources/ticket/IjTy0OsqSQSYrfk47Xr9Eg/Anlage_N_2025.pdf 
https://www.formulare-bfinv.de/ffw/resources/ticket/TMxUq3edSKGIiWVdkFMtYw/Anlage_Sonderausgaben_2025.pdf
https://www.formulare-bfinv.de/ffw/resources/ticket/zC1WoejvS22LaOOtZ8mm_g/ESt_1_A_2025.pdf
the app determines which form to use and asks the user questions to fill out the form.
in the end, the user can download the full form.

these are the technologies to use:
the app runs in the web, choose the right frontend language
elevenlabs for the voice 
openai as llm (we have an openai api key)
whatever else is needed.


for architecture:
create a project which does not call any backend, it should just use the sdk for elevenlabs and openai to send the api call directly.
do a plan first and ask questions