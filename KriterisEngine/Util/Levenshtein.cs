namespace KriterisEngine
{
    public static class Levenshtein
    {
        /// <summary>
        /// Compute Levenshtein distance
        /// </summary>
        /// <returns>
        /// Distance between the two strings. The larger the number, the bigger the difference.
        /// </returns>
        public static int LevenshteinDistance(this string s, string t)
        {
            int n = s.Length;
            int m = t.Length;
            var d = new int[n + 1, m + 1]; // matrix
            int cost;

            if (n == 0) return m;
            if (m == 0) return n;

            for (int i = 0; i <= n; d[i, 0] = i++) ;
            for (int j = 0; j <= m; d[0, j] = j++) ;

            for (int i = 1; i <= n; i++)
            {
                for (int j = 1; j <= m; j++)
                {
                    cost = (t.Substring(j - 1, 1) == s.Substring(i - 1, 1) ? 0 : 1);
                    d[i, j] = System.Math.Min(
                        System.Math.Min(d[i - 1, j] + 1, d[i, j - 1] + 1),
                        d[i - 1, j - 1] + cost);
                }
            }

            return d[n, m];

        }

    }
}
