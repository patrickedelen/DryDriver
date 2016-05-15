using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Runtime.Serialization.Json;
using System.Text;
using System.Threading.Tasks;
using System.Web.Script.Serialization;

namespace Dry_Driver_Console_Backend
{
    class Program
    {
        static void Main(string[] args)
        {
            List<BsonDocument> result = new List<BsonDocument>();

            WebClient webClient = new WebClient();
            Stream stream = webClient.OpenRead("http://houstontx.gov/heatmaps/datafiles/floodingheatmap12m.txt");


            using (StreamReader reader = new StreamReader(stream))
            {
                int line=0;
                while (reader.Peek() >= 0)
                {
                    string[] stringData = reader.ReadLine().Split('|');
                    line++;
                    if (line > 2)
                    {

                        FlodData floodData = new FlodData();
                        if (stringData.Count() > 8)
                        {

                            floodData.Cordinate[0] = decimal.Parse(stringData[2]); //Longitud
                            floodData.Cordinate[1] = decimal.Parse(stringData[1]); //Latitud
                            floodData.Address = stringData[3].Trim();
                            floodData.CreateDate = DateTime.Parse(stringData[4]);
                            if (stringData[5].Trim() != "NULL")
                                floodData.ClosedDate = DateTime.Parse(stringData[5]);
                            floodData.SourceType = "311";
                            floodData.MetaData.CaseType = stringData[7];
                            floodData.MetaData.CaseNumber = long.Parse(stringData[8]);

                            using (MemoryStream jsonStream = new MemoryStream())
                            {
                                DataContractJsonSerializer serializer = new DataContractJsonSerializer(typeof(FlodData));
                                serializer.WriteObject(jsonStream, floodData);
                                jsonStream.Position = 0;
                                StreamReader sr = new StreamReader(jsonStream);
                                string post = sr.ReadToEnd();

                                result.Add(BsonSerializer.Deserialize<BsonDocument>(post));
                            }
                        }
                    }

                }
            }

            var connectionString = "mongodb://root:1234Pizza@ds023432.mlab.com:23432/drydriver";
            var client = new MongoClient(connectionString);
            var database = client.GetDatabase("drydriver");
            var collection = database.GetCollection<BsonDocument>("events");
            //collection.InsertMany(result);
            //Console.ReadKey();

            ///
            /// FWS Data Post
            ///
            Console.WriteLine("Getting Harris County Bayou Levels");
            result.Clear();
            HarrisFWS FWSobj = new HarrisFWS();
            //you can change this to GetFWSjsonStreamCurrent(7) to get current data
            Task<string> task1 = FWSobj.GetFWSjsonStreamHistorical("4/18/2016 3:18:15 PM", 1440);
            
            JavaScriptSerializer jss = new JavaScriptSerializer();
            var d = jss.Deserialize<dynamic>(task1.Result);
            var sites = d["Sites"];
            foreach (var site in sites)
            {
                FlodData floodData = new FlodData();
                if (site["StreamData"] != null) //sometimes null
                {

                    decimal currentLevel = site["StreamData"][0]["CurrentLevel"];
                    decimal TOB = site["StreamData"][0]["ChannelInfo"]["TOB"];
                    if (currentLevel > TOB)
                    {
                        Console.WriteLine(site["Location"] + " IS OVERFLOWING");
                        floodData.Cordinate[0] = site["Longitude"];
                        floodData.Cordinate[1] = site["Latitude"]; 
                        floodData.Address = site["Location"];
                        floodData.CreateDate = DateTime.Now;

                        //floodData.ClosedDate = DateTime.Parse(stringData[5]);  need to consider this somehow
                        floodData.SourceType = "FWS";
                        floodData.MetaData.CaseType = "Flooding";
                        floodData.MetaData.CaseNumber = site["SiteId"];
                        
                        //Console.WriteLine(site["StreamData"][0]["CurrentLevel"]);
                        //Console.WriteLine(site["StreamData"][0]["ChannelInfo"]["TOB"]);
                        using (MemoryStream jsonStream = new MemoryStream())
                        {
                            DataContractJsonSerializer serializer = new DataContractJsonSerializer(typeof(FlodData));
                            serializer.WriteObject(jsonStream, floodData);
                            jsonStream.Position = 0;
                            StreamReader sr = new StreamReader(jsonStream);
                            string post = sr.ReadToEnd();

                            result.Add(BsonSerializer.Deserialize<BsonDocument>(post));
                        }

                    }
                   
                }

            }
            //write to Mongo
            collection.InsertMany(result);
        }
    }
}
