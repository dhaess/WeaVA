import pandas as pd
import numpy as np
import geopy.distance as gd
from scipy.spatial.distance import pdist
import phate


def map_distance(a, b):
    print("test", a)
    return gd.distance([a[1], a[2]], [b[1], b[2]]).km


def calculate_ms_phate(data):
    df = pd.DataFrame(data)
    phate_op = phate.PHATE(mds_dist=map_distance)
    coordinates = df.loc[:, "coordinates"].apply(pd.Series)

    df2 = pd.DataFrame(df.loc[:, "id"])
    df2['lat'] = coordinates.loc[:, 0]
    df2['lng'] = coordinates.loc[:, 1]
    Y = phate.mds.embed_MDS(df2, distance_metric=map_distance)

    return data