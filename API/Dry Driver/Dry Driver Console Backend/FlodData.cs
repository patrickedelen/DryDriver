using System;
using System.Collections.Generic;
using System.Runtime.Serialization;


namespace Dry_Driver_Console_Backend
{
    [DataContract]
    public class FlodData
    {
        private DateTime _createDate;
        [DataMember]
        public DateTime CreateDate
        {
            get
            {
                return _createDate;
            }

            set
            {
                _createDate = value;
            }
        }

        private DateTime _closedDate;

        [DataMember]
        public DateTime ClosedDate
        {
            get
            {
                return _closedDate;
            }

            set
            {
                _closedDate = value;
            }
        }

        [DataMember]
        public decimal[] Cordinate
        {
            get
            {
                return _cordinate;
            }

            set
            {
                _cordinate = value;
            }
        }

        private decimal[] _cordinate;

        private string _sourceType;

        [DataMember]
        public string SourceType
        {
            get { return _sourceType; }
            set { _sourceType = value; }
        }

        private string _address;

        [DataMember]
        public string Address
        {
            get { return _address; }
            set { _address = value; }
        }

        private SourceMeta _metaData;

        public SourceMeta MetaData
        {
            get { return _metaData; }
            set { _metaData = value; }
        }


        public FlodData()
        {
            _cordinate = new decimal[2];
            _metaData = new SourceMeta();
        }

    }

    [DataContract]
    public class SourceMeta
    {
        public long CaseNumber { get; set; }
        public string CaseType { get; set; }

    }

        //[DataContract]
    //public class Cordinate
    //{
    //    [DataMember]
    //    public decimal Latutude;
    //    [DataMember]
    //    public decimal Longitude;

    //    public override string ToString()
    //    {
    //        return "["+Longitude.ToString() + "," + Latutude.ToString()+"]";
    //    }
    //}

    [DataContract]
    public class FlodDataCollection
    {
        [DataMember]
        public List<FlodData> Items { get; set; }


    }

}