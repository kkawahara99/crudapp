import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job

# ジョブパラメータの取得
args = getResolvedOptions(
  sys.argv,
  [
    'JOB_NAME',
    'DATABASE_NAME',
    'TABLE_NAME',
    'TARGET_BUCKET_PATH',
  ]
)

# コンテキストの初期化
sc = SparkContext()
glueContext = GlueContext(sc)
job = Job(glueContext)
job.init(args['JOB_NAME'], args)

# データカタログ読み込み
data_source = glueContext.create_dynamic_frame.from_catalog(
  database=args["DATABASE_NAME"],
  table_name=args["TABLE_NAME"],
  transformation_ctx="data_source"
)

# 抽出データ保存
glueContext.write_dynamic_frame.from_options(
  frame=data_source,
  connection_type="s3",
  format="glueparquet",
  connection_options={
    "path": f'{args["TARGET_BUCKET_PATH"]}/{args["TABLE_NAME"]}',
    "partitionKeys": []
  },
  format_options={"compression": "snappy"},
  transformation_ctx="data_target"
)

job.commit()