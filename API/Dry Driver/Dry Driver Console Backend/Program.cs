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

                            floodData.Cordinate[0] = decimal.Parse(stringData[1]);
                            floodData.Cordinate[1] = decimal.Parse(stringData[2]);
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
            collection.InsertMany(result);
            //Console.ReadKey();
        }
    }
}
