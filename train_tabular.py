import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from joblib import dump

# Load tabular data
df = pd.read_csv('environmental_conditions.csv')

# Check for missing values in the Environmental Condition column
if df['Environmental Condition'].isnull().any():
    print("Warning: Found NaN values in 'Environmental Condition' column. Handling missing values.")
    # Replace NaN values in 'Environmental Condition' with 'bad' or remove rows with NaN
    df['Environmental Condition'] = df['Environmental Condition'].fillna('bad')

# Encode the 'Environmental Condition' column (e.g., 'good', 'bad')
le = LabelEncoder()
df['Environmental Condition'] = le.fit_transform(df['Environmental Condition'])

# Print class mapping for debugging
print(f"Label encoding mapping: {dict(zip(le.classes_, le.transform(le.classes_)))}")

# Features (X) and labels (y)
X = df[['Maximum Temperature', 'Minimum Temperature', 'Temperature', 'Precipitation', 'Soil pH', 'Relative Humidity']].values
y = df['Environmental Condition'].values  # Target variable

# Standardize features
scaler = StandardScaler()
X = scaler.fit_transform(X)

# Split into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train a Random Forest on the tabular data
rf_model = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
rf_model.fit(X_train, y_train)

# Save the Random Forest model and the scaler
dump(rf_model, '../Backend/Models/rf_model.pkl')
dump(scaler, '../Backend/Models/scaler.pkl')

# Optional: Print model accuracy on test data
score = rf_model.score(X_test, y_test)
print(f"Model accuracy on test data: {score:.4f}")
