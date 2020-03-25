from requests import get
from bs4 import BeautifulSoup
import re
import yaml

# Change the name of some countries to make them equal to the names in the React map library
changeNameList = {
    'united states': 'united states of america',
    'republic of ireland': 'ireland',
    'czech republic': 'czechia',
    'bosnia and herzegovina': 'bosnia and herz.',
    'north macedonia': 'macedonia',
    'georgia (country)': 'georgia'
}
# Remove these countries because their data is unreliable
removeNameList = ['mexico']

base_url = 'https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_'
country_list_url = 'https://en.wikipedia.org/wiki/2019%E2%80%9320_coronavirus_pandemic'

def scrapeCountry(countryURL):
    #Takes in relative URL path and returns data on that country
    raw_html = get(base_url+countryURL)
    parsed = BeautifulSoup(raw_html.content, 'html.parser')

    a = parsed.find_all("table")
    data=[]
    for table in a:
        #Only continue if it is the correct type of table (which most major country pages have)
        if (not "COVID-19 cases in " in table.text) or (not "# of cases" in table.text): continue
        
        rows = table.find_all('tr')
        for row in rows:
            cols = row.find_all('td')

            #The correct table should have 3 or 4 coloumns
            if len(cols) >= 3:
                date = cols[0].get_text().strip()                
                if (len(date) <= 4 or (date[0:4] != '2020' and date[-4:] != '2020')): continue
                dayInfo = dict()
                dayInfo['date'] = date

                infectedString = cols[2].get_text().strip()
                infectedSplitStrings = infectedString.split('(+')
                if (len(infectedSplitStrings) == 1):
                    dayInfo['infected'] = re.sub("[^0-9]", "", infectedString)
                    dayInfo['infected_increase_percentage'] = '0'
                    
                else: 
                    dayInfo['infected'] = re.sub("[^0-9]", "", infectedSplitStrings[0])
                    dayInfo['infected_increase_percentage'] = infectedSplitStrings[1].split('%')[0]

                if len(cols) == 4:
                    deathsString = cols[3].get_text().strip()
                    if (len(deathsString) == 0):
                        dayInfo['deaths'] = '0'
                        dayInfo['deaths_increase_percentage'] = '0'
                    else:
                        deathsSplitStrings = deathsString.split('(')
                        dayInfo['deaths'] = re.sub("[^0-9]", "", deathsSplitStrings[0])
                        if len(deathsSplitStrings) == 1 or len(deathsSplitStrings[1]) <= 2:
                            dayInfo['deaths_increase_percentage'] = '0'
                        else:
                            dayInfo['deaths_increase_percentage'] = re.sub("[^0-9]", "", deathsSplitStrings[1])
                print(dayInfo)
                data.append(dayInfo)
    data.reverse()
    return data

def scrapeAll():
    list_raw_html = get(country_list_url)
    list_parsed = BeautifulSoup(list_raw_html.content, 'html.parser')

    b = list_parsed.find('table', attrs={'class': 'wikitable'}).find_all('a')
    country_list = []
    for link in b:
        if (link.get('href') == None or not '/wiki/2020_coronavirus_pandemic_in_' in link.get('href')): continue
        print(link.get('href'))
        country_list.append(link.get('href'))
    print(country_list)

    countries = []
    for country in country_list:
        countries.append(country.replace('/wiki/2020_coronavirus_pandemic_in_', ''))


    countrySummaryList = []
    for countryURL in countries:
        countryName = countryURL.replace('the_', '').replace('_', ' ').lower()
        # Dont add countries with unreliable graph
        if countryName in removeNameList: continue
        # Change name of country to something the React map library understands
        if countryName in changeNameList: countryName = changeNameList[countryName]

        data = scrapeCountry(countryURL)

        print(countryName)
        countrySummary = dict()
        countrySummary['country'] = countryName
        if len(data) >= 1:
            with open('public/'+countryName+'.yml', 'w') as outfile:
                yaml.dump(data, outfile, default_flow_style=False)

            if 'infected' in data[0]: countrySummary['infected'] = data[0]['infected']
            if 'deaths' in data[0]: countrySummary['deaths'] = data[0]['deaths']
            
        countrySummaryList.append(countrySummary)

    with open('public/summary.yml', 'w') as outfile:
        yaml.dump(countrySummaryList, outfile, default_flow_style=False)

if __name__ == "__main__":
    scrapeAll()