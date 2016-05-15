using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Net.Http;
namespace Dry_Driver_Console_Backend
{
    class HarrisFWS
    {
        /// <summary>
        /// This makes a call to the harris county flood warning system to get historical Bayou levels
        /// </summary>
        /// <param name="endDate">The End date in local Houston time mm/dd/yy hh:mm:ss AM/PM</param>
        /// <param name="interval">The interval in minutes</param>
        /// <returns></returns>
        public async Task<string> GetFWSjsonStreamHistorical(string endDate, long interval)
        {
            HttpClient client = new HttpClient();
            string url = "http://www.harriscountyfws.org/Home/GetSiteHistoricRainfall";
            var pairs = new List<KeyValuePair<string, string>>
            {
                new KeyValuePair<string, string>("regionId", "1 "),
                new KeyValuePair<string, string>("endDate",endDate),
                new KeyValuePair<string, string>("interval", interval.ToString()),
                new KeyValuePair<string, string>("unit", "mi")
                //new KeyValuePair<string, string>("dt", "1463257991176"),
            };

            var content = new FormUrlEncodedContent(pairs);

            HttpResponseMessage response = client.PostAsync(url, content).Result;

            string responseContent = await response.Content.ReadAsStringAsync();

            return responseContent;
        }

        /// <summary>
        /// This makes a call to the harris county flood warning system to get current Bayou levels
        /// </summary>
        /// <param name="timeSpan">Not sure what the units are</param>       
        /// <returns></returns>
        public async Task<string> GetFWSjsonStreamCurrent(int timeSpan)
        {

            TimeSpan t = DateTime.UtcNow - new DateTime(1970, 1, 1);
            int secondsSinceEpoch = (int)t.TotalSeconds;
            HttpClient client = new HttpClient();
            string url = "http://www.harriscountyfws.org/Home/GetSiteRecentData";
            var pairs = new List<KeyValuePair<string, string>>
            {
                new KeyValuePair<string, string>("regionId", "1 "),
                new KeyValuePair<string, string>("timeSpan", timeSpan.ToString()),
                new KeyValuePair<string, string>("unit", "mi"),
                new KeyValuePair<string, string>("dt", secondsSinceEpoch.ToString()),
            };

            var content = new FormUrlEncodedContent(pairs);

            HttpResponseMessage response = client.PostAsync(url, content).Result;

            string responseContent = await response.Content.ReadAsStringAsync();

            return responseContent;
        }
    }
}
