using MongoDB.Bson;
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
            FlodDataCollection result = new FlodDataCollection();
            result.Items = new List<FlodData>();

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
                        
                        floodData.Cordinate[0] = decimal.Parse(stringData[1]);
                        floodData.Cordinate[1] = decimal.Parse(stringData[2]);
                        floodData.Address = stringData[3];
                        floodData.CreateDate = DateTime.Parse(stringData[4]);
                        if(stringData[5].Trim() !="NULL")
                            floodData.ClosedDate = DateTime.Parse(stringData[5]);
                        floodData.SourceType = "311";
                        floodData.MetaData.CaseType = stringData[7];
                        floodData.MetaData.CaseNumber = long.Parse(stringData[8]);

                        result.Items.Add(floodData);
                    }

                }
            }

            MemoryStream jsonStream = new MemoryStream();
            DataContractJsonSerializer serializer = new DataContractJsonSerializer(typeof(FlodDataCollection));
            serializer.WriteObject(jsonStream, result);

            jsonStream.Position = 0;
            StreamReader sr = new StreamReader(jsonStream);
            string post = sr.ReadToEnd();

            var connectionString = "mongodb://54.200.18.192:27017";

            var client = new MongoClient(connectionString);
            var database = client.GetDatabase("test");

            var document = BsonSerializer.Deserialize<BsonDocument>(post);
            var collection = database.GetCollection<BsonDocument>("test_collection");
            await collection.InsertOneAsync(document);

        }
    }
}
